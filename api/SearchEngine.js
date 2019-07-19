const snowball = require('node-snowball');
const stopword = require('stopword')

// helpers

// TODO: investigate solving issues like $9.99/$9,99 becoming 9 99
const ENGLISH_WORDS_PUNCT_REGEX = /([\s\-\.\,\;\\\/\(\)\{\}\[\]\|]+)/

/**
  The default tokenizer function uses the following pipeline:
  - Split by whitespace, hyphen, period, comma, semi-colon, pipe, and all
    slashes/braces/brackets
  - Trim and remove special chars (\W) from tokens
  - Regularize input by lowercasing
  - Convert all words to lemma versions
  - Clamp strings to length 255 (max size of keyword due to varchar limits)
  - Remove stopwords and tokens of size 0
  - Remove duplicates
*/
const defaultTokenizerFn = (searchPhrase) => {
  return Array.from(
    new Set(
      stopword.removeStopwords(
        (searchPhrase || "" )
          .split(ENGLISH_WORDS_PUNCT_REGEX)
          .filter(s => s)
          .map(s => s.trim())
          .map(s => s.replace(/\W+/, ''))
          .map(s => s.toLowerCase())
          .map(s => snowball.stemword(s, 'english'))
          .map(s => s.slice(0, 255))
      ).filter(isValidKeyword)
    )
  )
}

// validate a configuration object
const validateObject = (obj, requiredParams, defaults) => {
  if (!obj) throw new Error('obj must be an object')
  for (const p of requiredParams) {
    if (!obj[p]) throw new Error(p + ' is a required parameter')
  }
  defaults = defaults || {}
  return Object.assign({}, defaults, obj)
}

// validates and coerces ID
const validateId = (id) => {
  if (!id) throw new Error('id is falsy')
  id = Number.parseInt(id)
  if (!Number.isFinite(id) || id < 1) throw new Error('id is invalid')
  return id
}

const isValidKeyword = (keyword) => keyword && keyword.length > 0

const matchColumnName = (fieldName) => 'matches_' + fieldName

/**

  A text search engine middleware for knex.

  Gives knex developers an Abstract Data Structure for searching databases in
  a unified and efficient manner. The ADS should support the following
  operations:
  - add(record)
  - has(recordId)
  - remove(recordId)
  - search(searchPhrase)

  Updates are supported by sequential remove(recordId) + add(record) ops.

  # How does it work?

  The search engine uses a table to store an inverted index of a collection
  of documents with columns recording # of matches per field.

  This allows for fast fuzzy matching over a large set of documents with
  relevance ranking.

  This is an optimized solution for text search meant to be combined with your
  own query building techniques to provide filtering, facet searching, etc.

  The target table's schema will be adjusted to fit the needs of the current
  instance, so don't point it anything whose data you like obviously.

  Searches over different document sets should target different tables.

  Fuzzy matching and query expansion is supported by a user defined tokenizer
  function (see constructor)

  Currently, the search engine supports changing search field weights and
  removing search fields implicitly via our data model.

  Adding a new search field requires rebuilding the entire index
  (i.e., remove(record), add(record) ...), fields that were not present in
  config when object was added will default to 0 match score

 */
class SearchEngine {

  /**

  The constructor accepts one argument which is an object with the following fields:
   - knex - KnexClient!
   - keywordTableName - string!
   - searchFields - [SearchFieldConfig!]!
   - tokenizerFn - fn!
   - idFieldName - string - defaults to 'id'

   "tokenizerFn" should be a monotonic pure function which accepts a string "searchPhrase"
   and returns an array which is the set of keywords related to the searchPhrase.
   Consider it to be a hash from the string space to a set of keyword matches: (record, weight) pairs.
   Two strings which resolve to exactly the same set of keyword matches can be consider the semantically the same.
   Careful understanding of this principle allows for fuzzy matching and query expansion via this fn.

   SearchFieldConfig - object with the shape:
   {
     fieldName: String!
     weight: Int!
   }

   */
  constructor(config) {
    config = validateObject(
      config,
      [ 'knex', 'keywordTableName', 'searchFields' ],
      {
        tokenizerFn: defaultTokenizerFn,
        idFieldName: 'id',
      }
    )
    if (!Array.isArray(config.searchFields))
      throw new Error('config.searchFields is not an array')
    config.searchFields = config.searchFields.map(searchField => validateObject(searchField, ['fieldName', 'weight']))
    config.searchFields.forEach(searchField => {
      const isValidColumnName = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(searchField.fieldName)
      if (!isValidColumnName) {
        throw new Error('field ' + searchField.fieldName + ' must be a possible valid sql column name')
      }
    })
    for (const key in config) {
      this[key] = config[key]
    }
  }

  // lazy init all the stuff we need here
  async init() {
    if (this.isInitialized) return
    this.isInitialized = true

    const isTableCreated = await this.knex.schema.hasTable(this.keywordTableName)
    if (!isTableCreated) {
      await this.knex.schema.createTable(this.keywordTableName, table => {
        table.string('keyword').notNullable()
        table.integer('record').unsigned().notNullable()
        table.primary(['keyword', 'record'])
      })
    } else {
      const hasKeywordColumn = await this.knex.schema.hasColumn(this.keywordTableName, 'keyword')
      const hasRecordColumn = await this.knex.schema.hasColumn(this.keywordTableName, 'record')
      // TODO: check if primary key is correct here
      if (!hasKeywordColumn || !hasRecordColumn) {
        await this.knex.schema.table(table => {
          if (!hasKeywordColumn)
            table.string('keyword').notNullable()
          if (!hasRecordColumn)
            table.integer('record').unsigned().notNullable()
        })
      }
    }

    // traverse searchFields and ensure all columns are setup for calculating relevance score
    const requiredColumns = []

    await Promise.all(this.searchFields.map(async searchField => {
      const columnName = matchColumnName(searchField.fieldName)
      const hasColumn = await this.knex.schema.hasColumn(this.keywordTableName, columnName)
      if (!hasColumn) {
        requiredColumns.push(columnName)
      }
    }))

    if (requiredColumns.length > 0) {
      await this.knex.schema.alterTable(this.keywordTableName, table => {
        requiredColumns.forEach(columnName => {
          table.integer(columnName).defaultTo(0)
        })
      })
    }
  }

  /**
   * Insert a record into the search engine database
   */
  async add(record) {
    record = validateObject(record, [ this.idFieldName ])
    const recordId = validateId(record[this.idFieldName])
    await this.init()
    const keywordMap = {}
    for (const searchField of this.searchFields) {
      const { fieldName } = searchField
      if (!(record[fieldName] && typeof record[fieldName] == "string")) {
        continue
      }
      const keywords = this.tokenizerFn(record[fieldName])
      keywords.forEach(keyword => {
        if (!isValidKeyword(keyword)) {
          throw new Error('keyword was invalid: ' + keyword)
        }
        if (!keywordMap[keyword]) {
          keywordMap[keyword] = {}
        }
        const colName = matchColumnName(fieldName)
        keywordMap[keyword][colName] = (keywordMap[keyword][colName] || 0) + 1
      })
    }
    await this.knex.transaction(tx => {
      const inserts = []
      for (const keyword in keywordMap) {
        inserts.push(Object.assign({
          keyword,
          record: recordId,
        }, keywordMap[keyword]))
      }
      return tx.insert(inserts).into(this.keywordTableName)
    })
  }

  async has(recordId) {
    recordId = validateId(recordId)
    await this.init()
    const count = await this.knex.count('* as count').from(this.keywordTableName).where('record', recordId)
    return count > 0
  }

  /**
   * Remove a record from the search engine database
   */
  async remove(recordId) {
    recordId = validateId(recordId)
    await this.init()
    await this.knex(this.keywordTableName).where('record', recordId).del()
  }

  /**
   * Returns a query which returns a table of (id, relevance) based on relevance of record to searchPhrase
   * Only call this after you've await'd init() or some other function (they all await init first)
   */
  search(searchPhrase) {
    if (!searchPhrase || !(typeof searchPhrase == "string")) {
       throw new Error('invalid searchPhrase')
    }

    const keywords = this.tokenizerFn(searchPhrase).filter(isValidKeyword)

    if (!keywords || keywords.length == 0) {
      // TODO: return everything
      return this.knex.select('record as id', knex.raw('0 as relevance'))
                      .from(this.keywordTableName)
                      .distinct()
    }

    const self = this
    const _searchKeyword = (keyword) => {
      return self.knex
        .select('record', self.knex.raw(this.searchFields.map(searchField => matchColumnName(searchField.fieldName) + ' * ' + searchField.weight).join(' + ') + ' as weight'))
        .from(this.keywordTableName)
        .where('keyword', keyword)
    }

    let innerQuery = _searchKeyword(keywords[0])
    for (let i = 1; i < keywords.length; i++) {
      innerQuery = innerQuery.unionAll(_searchKeyword(keywords[i]))
    }

    innerQuery = innerQuery.as('_SearchEngine_inner')

    return this.knex
      .select('record as id')
      .sum('weight as relevance')
      .from(innerQuery)
      .groupBy('record')
  }
}

module.exports = SearchEngine

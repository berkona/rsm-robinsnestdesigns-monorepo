const snowball = require('node-snowball');
const stopword = require('stopword')

// helpers
const defaultTokenizerFn = (searchPhrase) => {
  let words = searchPhrase
    .split(' ')
    .map(s => s.trim().replace(/\W+/, '').toLowerCase())
    .filter(isValidKeyword)
  words = stopword.removeStopwords(words)
  words = words
    .map(s => snowball.stemword(s, 'english'))
    .filter(isValidKeyword)
  return words
}


// validate a configuration object
const validateConfiguration = (obj, requiredParams, defaults) => {
  for (const p of requiredParams) {
    if (!obj[p]) throw new Error(p + ' is a required parameter')
  }
  return Object.assign({}, defaults, obj)
}

// validates and coerces ID
const validateId = (id) => {
  if (!id) throw new Error('id is falsy')
  id = Number.parseInt(id)
  if (!Number.isFinite(id) || id < 1) throw new Error('id is invalid')
  return id
}

const isValidKeyword = (keyword) => keyword && keyword.match(/^\w+$/)

/**

  A search engine middleware for knex.

  Gives knex developers an Abstract Data Structure for searching databases in a unified and efficient manner.  The ADS should support the following operations:
  - add(record)
  - has(recordId)
  - remove(recordId)
  - search(searchPhrase)

  Updates are supported by sequential remove(recordId) + add(record) ops.

  Fuzzy matching and query expansion is supported by a user defined tokenizer function

 */
class SearchEngine {

  /**

  The constructor accepts one argument which is the config object of shape:
   - knex - KnexClient!
   - keywordTableName - string!
   - searchFields - [SearchFieldConfig!]!
   - tokenizerFn - fn!
   - idFieldName - string - defaults to 'id'

   SearchFieldConfig - object with the shape:
   {
     fieldName: String!
     weight: Int!
   }

   */
  constructor(config) {
    config = validateConfiguration(
      config,
      [ 'knex', 'keywordTableName', 'searchFields' ],
      {
        tokenizerFn: defaultTokenizerFn,
        idFieldName: 'id',
      }
    )
    config.searchFields = config.searchFields.map(searchField => validateConfiguration(searchField, ['fieldName', 'weight']))
    for (const key in config) {
      this[key] = config[key]
    }
  }

  /**
   * Insert a record into the search engine database
   */
  async add(record) {
    const recordId = validateId(record[this.idFieldName])
    await this._init()
    const keywordMap = {}
    for (const searchField of this.searchFields) {
      const { fieldName, weight } = searchField
      if (!(record[fieldName] && typeof record[fieldName] == "string")) {
        continue
      }
      const keywords = this.tokenizerFn(record[fieldName])
      keywords.forEach(keyword => {
        if (!isValidKeyword(keyword)) {
          throw new Error('keyword was invalid: ' + keyword)
        }
        if (!keywordMap[keyword]) {
          keywordMap[keyword] = {
            weight: 0
          }
        }
        keywordMap[keyword].weight += weight
      })
    }
    for (const keyword in keywordMap) {
      const { weight } = keywordMap[keyword]
      await this.knex(this.keywordTableName).insert({
        keyword,
        weight,
        record: recordId,
      })
    }
  }

  async has(recordId) {
    recordId = validateId(recordId)
    await this._init()
    const count = await this.knex.count('* as count').from(this.keywordTableName).where('record', recordId)
    return count > 0
  }

  /**
   * Remove a record from the search engine database
   */
  async remove(recordId) {
    recordId = validateId(recordId)
    await this._init()
    await this.knex(this.keywordTableName).where('record', recordId).del()
  }

  /**
   * Returns a query which returns a table of (record, relevance) based on relevance of record to searchPhrase
   */
  search(searchPhrase) {
    if (!searchPhrase || !(typeof searchPhrase == "string")) {
       throw new Error('invalid searchPhrase')
    }

    const keywords = this.tokenizerFn(searchPhrase).filter(isValidKeyword)
    if (!keywords || keywords.length === 0) {
      // TODO: return everything
      return this.knex.select('record as id', '0 as relevance')
                      .from(this.keywordTableName)
                      .distinct()
    }

    // do searchKeyword(keywords[0])
    //      .unionAll(builder => searchKeyword(keywords[1]))
    //      .unionAll(builder => searchKeyword(keywords[2]))
    //      .unionAll(builder => searchKeyword(keywords[3]))
    //    ...

    let innerQuery = this._searchKeyword(keywords[0], this.knex)
    for (let i = 1; i < keywords.length; i++) {
      innerQuery = innerQuery.unionAll(builder => this._searchKeyword(keywords[i], builder))
    }
    innerQuery = innerQuery.as('_SearchEngine_inner')

    return this.knex
      .select('record as id')
      .sum('weight as relevance')
      .from(innerQuery)
      .groupBy('record')
  }

  // lazy init all the stuff we need
  async _init() {
    const isTableCreated = await this.knex.schema.hasTable(this.keywordTableName)
    if (!isTableCreated) {
      await this.knex.schema.createTable(this.keywordTableName, table => {
        table.increments('id')
        table.string('keyword')
        table.integer('record')
        table.integer('weight')
      })
    }
  }

  async _searchKeyword(keyword, builder) {
    return builder
      .select('record', 'weight')
      .from(this.keywordTableName)
      .where('keyword', keyword)
  }
}

module.exports = SearchEngine

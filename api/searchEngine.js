const knex = require('./knex')
const SearchEngine = require('./SearchEngine')

const searchEngine = new SearchEngine({
  knex,
  keywordTableName: 'SearchEngineKeywords',
  searchFields: [
    { fieldName: 'sku', weight: 1000 },
    { fieldName: 'name', weight: 200 },
    { fieldName: 'keywords', weight: 100 },
    { fieldName: 'category', weight: 50 },
    { fieldName: 'subcategory', weight: 50 },
    { fieldName: 'description', weight: 25 },
  ],
})

module.exports = searchEngine

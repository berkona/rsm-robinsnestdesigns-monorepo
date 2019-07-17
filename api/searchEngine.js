const knex = require('./knex')
const SearchEngine = require('./SearchEngine')

const searchEngine = new SearchEngine({
  knex,
  keywordTableName: 'SearchEngineKeywords',
  searchFields: [
    { fieldName: 'sku', weight: 1000 },
    { fieldName: 'name', weight: 100 },
    { fieldName: 'keywords', weight: 80 },
    { fieldName: 'subcategory', weight: 60 },
    { fieldName: 'category', weight: 40 },
    { fieldName: 'description', weight: 20 },
  ],
})

module.exports = searchEngine

const knex = require('./knex')
const SearchEngine = require('./SearchEngine')

const searchEngine = new SearchEngine({
  knex,
  keywordTableName: 'SearchEngineKeywords',
  searchFields: [
    { fieldName: 'name', weight: 200 },
    { fieldName: 'keywords', weight: 100 },
    { fieldName: 'category', weight: 50 },
    { fieldName: 'subcategory', weight: 50 },
    { fieldName: 'category2', weight: 50 },
    { fieldName: 'subcategory2', weight: 50 },
    { fieldName: 'category3', weight: 50 },
    { fieldName: 'subcategory3', weight: 50 },
    { fieldName: 'description', weight: 25 },
  ],
})

module.exports = searchEngine

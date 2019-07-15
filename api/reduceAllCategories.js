const reduceCategory = require('./reduceCategory')

function reduceAllCategories(rows) {
  return rows.map(reduceCategory)
}

module.exports = reduceAllCategories

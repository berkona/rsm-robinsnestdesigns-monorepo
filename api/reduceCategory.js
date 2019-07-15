function reduceCategory(row) {
  return {
    id: row.ID,
    title: row.Category,
    comments: row.Comments,
  }
}

module.exports = reduceCategory

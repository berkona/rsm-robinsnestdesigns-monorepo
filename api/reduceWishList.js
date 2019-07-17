const reduceProduct = require('./reduceProduct')

const reduceWishList = (rows) => {
    return rows.map((row) => {
      return {
        id: row.WishListID,
        dateAdded: row.AddedDate || new Date(),
        product: reduceProduct(row),
      }
    })
}

module.exports = reduceWishList

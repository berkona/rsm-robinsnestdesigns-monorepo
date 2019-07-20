function reduceProduct(row) {
  if (!row) return null

  const productVariants = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ].reduce((arr, nVariant) => {
    const priceField = 'Price' + nVariant
    const optionField = 'Option' + nVariant
    const id = Number.parseInt(('' + row.ProductID) + '' + (nVariant-1))
    if (row[priceField]) {
      arr.push({
        id,
        price: Number.parseFloat(row[priceField]),
        text: row[optionField] || "",
      })
    }
    return arr
  }, [])

  return {
    id: row.ProductID,
    sku: row.ItemID,
    qtyInStock: row.Qty || 0,
    name: row.ItemName,
    price: row.ItemPrice || 0.00,
    clearance: !!row.Clearance,
    salePrice: row.SalePrice,
    saleStart: row.Sale_Start,
    saleEnd: row.Sale_Stop,
    description: row.Description,
    image: row.Image,
    thumbnail: row.Thumbnail,
    category: row.Category,
    categoryId: row.CategoryId,
    subcategory: row.Subcategory,
    subcategoryId: row.SubcategoryId,
    category2: row.CategoryB,
    category3: row.CategoryC,
    subcategory2: row.SubCategoryB,
    subcategory3: row.SubCategoryC,
    hyperlinkedImage: row.hyperlinkedImage,
    keywords: row.Keywords || '',
    productVariants,
  }
}

module.exports = reduceProduct

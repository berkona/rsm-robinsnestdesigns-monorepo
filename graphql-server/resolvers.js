// Provide resolver functions for your schema fields

function reduceAllCategories(rows) {
  return rows.map(reduceCategory)
}

function reduceProduct(row) {
  return {
    id: row.ID,
    sku: row.ItemID,
    name: row.ItemName,
    price: row.ItemPrice,
    salePrice: row.SalePrice,
    saleStart: row.Sale_Start,
    saleEnd: row.Sale_Stop,
    description: row.Description,
    image: row.Image,
    thumbnail: row.Thumbnail,
    category: row.Category,
    subcategory: row.Subcategory,
  }
}

function reduceCategory(row) {
  return {
    id: row.ID,
    title: row.Category,
    comments: row.Comments,
  }
}

const resolvers = {
  Query: {
    category: (obj, args, context) => context.dataSources.db.getCategory(args.categoryId).then(x => reduceCategory(x[0])),
    allCategories: (obj, args, context) => context.dataSources.db.listCategories().then(reduceAllCategories),
    allSubcategories: (obj, args, context) => context.dataSources.db.listSubcategories(args.categoryId).then(reduceAllCategories),
    product: (obj, args, context) => context.dataSources.db.getProduct(args.productId).then(x => {
      return reduceProduct(x[0])
    }),
    allProducts: (obj, args, context) => context.dataSources.db.listProducts(args).then(results => {
      const [ rows, countRow ] = results
      return {
        total: countRow.nRecords,
        skip: args.skip,
        limit: args.limit,
        records: rows.map(reduceProduct)
      }
    }),
  },
}

exports.resolvers = resolvers

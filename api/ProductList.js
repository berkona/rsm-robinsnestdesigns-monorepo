const reduceAllCategories = require('./reduceAllCategories')
const reduceProduct = require('./reduceProduct')

module.exports = {
  total: async (obj, args, context) => {
    const [ { nRecords } ] = await context.dataSources.db.listProductsTotal(obj.args)
    return nRecords || 0
  },
  records: async (obj, args, context) => {
    const products = await context.dataSources.db.listProducts(obj.args)
    return products.map(reduceProduct)
  },
  categories: async (obj, args, context) => {
    const categories = await context.dataSources.db.listProductsCategories(obj.args)
    const categoriesObj = reduceAllCategories(categories)
    return categoriesObj
  },
  subcategories: async (obj, args, context) => {
    if (obj.args.categoryId) {
      const subcategories = await context.dataSources.db.listProductsSubcategories(obj.args)
      return reduceAllCategories(subcategories)
    }
  },
}

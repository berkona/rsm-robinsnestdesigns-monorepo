const reduceAllCategories = require('./reduceAllCategories')
const reduceProduct = require('./reduceProduct')

module.exports = {
  total: async (obj, args, context) => {
    const countRow = await context.dataSources.db.listProductsTotal(obj.args)
    return reduceAllCategories(countRow)
  },
  records: async (obj, args, context) => {
    const products = await context.dataSources.db.listProducts(obj.args)
    return products.map(reduceProduct)
  },
  categories: async (obj, args, context) => {
    const categories = await context.dataSources.db.listProductsCategories(obj.args)
    return reduceAllCategories(categories)
  },
  subcategories: async (obj, args, context) => {
    const subcategories = await context.dataSources.db.listProductsSubcategories(obj.args)
    return reduceAllCategories(subcategories)
  },
}

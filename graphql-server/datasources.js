const { SQLDataSource } = require("datasource-sql")

const generateId = (sqlId) => '' + sqlId

if (!process.env.SQL_HOST || !process.env.SQL_USER || !process.env.SQL_PWD || !process.env.SQL_DB) {
  throw new Error('You must set the environmental variables: SQL_HOST, SQL_USER, SQL_PWD, SQL_DB before starting server')
}

const knex = require('knex')({
  client: 'mssql',
  connection: {
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PWD,
    database: process.env.SQL_DB,
  },
})

const validateArgs = (args) => {
  args = Object.assign({}, { skip: 0, limit: 50 }, args)
  if (args.limit > 200) args.limit = 200
  if (args.skip < 0) args.skip = 0
  return args
}

class MyDB extends SQLDataSource {
  constructor() {
    super()
    this.knex = knex
  }

  getCategory(categoryId) {
    if (!categoryId) return Promise.reject(`categoryId is required`)
    const query = this.db.select(
      'Category.ID as ID',
      'Category.Category as Category',
      'Category.Comments as Comments',
    )
    .from('Category')
    .where('Category.ID', categoryId)
    .first()
    return this.getBatched(query)
  }

  listCategories() {
    const query = this.db.select(
      'Category.ID as ID',
      'Category.Category as Category',
      'Category.Comments as Comments'
    )
    .from('Category')
    .where('Category.Category', 'like', '%-%')
    return this.getBatched(query)
  }

  listSubcategories(categoryId) {
    if (!categoryId) return Promise.reject(`categoryId is required`)
    const query = this.db
      .select('Subcategory.ID as ID', 'Subcategory.Subcategory as Category', 'Comments')
      .from('Subcategory')
      .where('Subcategory.Category', '=', categoryId)
      .orderBy('Subcategory.Subcategory', 'ASC')
    return this.getBatched(query)
  }

  productFields() {
    return [
      'Products.ID as ID', 'ItemID',
      'ItemName', 'Description',
      'ItemPrice', 'Thumbnail', 'Image', 'SalePrice',
      'Sale_Start', 'Sale_Stop',
      'Category.Category as Category',
      'Subcategory.Subcategory as Subcategory'
    ]
  }

  getProduct(productId) {
    if (!productId) return Promise.reject(`productId is required`)
    const query = this.db.select(this.productFields())
    .from('Products')
    .where('Products.ID', productId)
    .innerJoin('Category', 'Products.Category', 'Category.ID')
    .innerJoin('Subcategory', 'Products.SubCategory', 'Subcategory.ID')
    .first()
    return this.getBatched(query)
  }

  listProducts(args) {
    args = validateArgs(args)

    let dataQuery =
      this.db.select(this.productFields())
        .from('Products')
        .innerJoin('Category', 'Products.Category', 'Category.ID')
        .innerJoin('Subcategory', 'Products.SubCategory', 'Subcategory.ID')

    let countQuery = this.db.count('* as nRecords').from('Products').first()

    if (args.subcategoryId) {
      dataQuery = dataQuery.where('Products.SubCategory', args.subcategoryId)
                   .orWhere('Products.SubCategoryB', args.subcategoryId)
                   .orWhere('Products.SubCategoryC', args.subcategoryId)
      countQuery = countQuery.where('Products.SubCategory', args.subcategoryId)
                   .orWhere('Products.SubCategoryB', args.subcategoryId)
                   .orWhere('Products.SubCategoryC', args.subcategoryId)
    }
    
    if (args.searchPhrase) {
      dataQuery = dataQuery.orWhere('Products.ItemName', 'like', `%${args.searchPhrase}%`)
                   .orWhere('Products.Description', 'like', `%${args.searchPhrase}%`)
                   .orWhere('Products.Keywords', 'like', `%${args.searchPhrase}%`)

     countQuery = countQuery.orWhere('Products.ItemName', 'like', `%${args.searchPhrase}%`)
                  .orWhere('Products.Description', 'like', `%${args.searchPhrase}%`)
                  .orWhere('Products.Keywords', 'like', `%${args.searchPhrase}%`)

    }

    dataQuery = dataQuery
      .orderBy('ID', 'ASC')
      .offset(args.skip)
      .limit(args.limit)

    return Promise.all([dataQuery, countQuery ])
  }
}

exports.MyDB = MyDB

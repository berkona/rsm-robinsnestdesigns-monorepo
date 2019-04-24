const { SQLDataSource } = require("datasource-sql")

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

const productFields =  [
  'Products.ID as ID',
  'ItemID',
  'ItemName',
  'Description',
  'ItemPrice',
  'Thumbnail',
  'Image',
  'SalePrice',
  'Sale_Start',
  'Sale_Stop',
  'Category.Category as Category',
  'Subcategory.Subcategory as Subcategory'
]

/**
  Creates a query s.t. it SELECT's productFields + relevance (semantic meaning) based on searchPhrase and filters
 */
const buildSearchQuery = (builder, subcategoryId, searchPhrase, countOnly) => {
  const makeQuery = (weight) => {
    let q = builder;
    if (countOnly) {
      q = q.count('* as nRecords').first()
    } else {
      q = q.select(knex.raw(`${weight} as relevance`), 'ID')
    }
    q = q.from('Products').where('Active', 1)
    if (subcategoryId) {
      q = q.where(builder => builder
        .orWhere('Products.SubCategory', subcategoryId)
        .orWhere('Products.SubCategoryB', subcategoryId)
        .orWhere('Products.SubCategoryC', subcategoryId)
      )
    }
    return q
  }

  // save work b/c we don't need to do a regex
  if (!searchPhrase) {
    return makeQuery(1)
  } else {
    return makeQuery(10).where('ItemName', 'like', `%${searchPhrase}%`)
      .union(
        makeQuery(5).where('Keywords', 'like', `%${searchPhrase}%`)
      )
      .union(
        makeQuery(2).where('Description', 'like', `%${searchPhrase}%`)
      )
  }
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

  getProduct(productId) {
    if (!productId) return Promise.reject(`productId is required`)
    const query = this.db.select(productFields)
    .from('Products')
    .where('Products.ID', productId)
    .leftJoin('Category', 'Products.Category', 'Category.ID')
    .leftJoin('Subcategory', 'Products.SubCategory', 'Subcategory.ID')
    .first()
    return this.getBatched(query)
  }

  listProducts(args) {
    args = validateArgs(args)

    const searchQuery = buildSearchQuery(this.db, args.subcategoryId, args.searchPhrase).as('Search')

    const dataQuery =  this.db.select(productFields)
      .from(searchQuery.clone())
      .innerJoin('Products', 'Search.ID', 'Products.ID')
      .leftJoin('Category', 'Products.Category', 'Category.ID')
      .leftJoin('Subcategory', 'Products.SubCategory', 'Subcategory.ID')
      .orderBy('relevance', 'desc')
      .orderBy('ItemName', 'asc')
      .offset(args.skip)
      .limit(args.limit)

    const countQuery = this.db.count('* as nRecords').from(searchQuery.clone()).first()

    return Promise.all([ dataQuery, countQuery ])
  }
}

exports.MyDB = MyDB

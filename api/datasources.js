const { SQLDataSource } = require("datasource-sql")

if (!process.env.SQL_ENGINE || !process.env.SQL_HOST || !process.env.SQL_USER || !process.env.SQL_PWD || !process.env.SQL_DB) {
  throw new Error('You must set the environmental variables: SQL_ENGINE, SQL_HOST, SQL_USER, SQL_PWD, SQL_DB before starting server')
}

const knex = require('knex')({
  client: process.env.SQL_ENGINE,
  connection: {
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PWD,
    database: process.env.SQL_DB,
  },
})

const validateArgs = (args) => {
  args = Object.assign({}, { skip: 0, limit: 50, sort: 'relevancy' }, args)
  if (args.limit > 200) args.limit = 200
  if (args.skip < 0) args.skip = 0
  return args
}

const categoryFields = [
  'Category.ID as ID',
  'Category.Category as Category',
  'Category.Comments as Comments'
]

const cartItemFields = [
  'Cart.ID as CartItemId',
  'CustomerID as OrderNo',
  'Quantity',
  'Option',
]

const effectivePriceCase = knex.raw(`(CASE
  WHEN Products.Price1 > 0
    THEN Products.Price1
  WHEN Products.SalePrice > 0
   AND Products.Sale_Start <= CURRENT_TIMESTAMP
   AND Products.Sale_Stop >= CURRENT_TIMESTAMP
   THEN Products.SalePrice
  ELSE Products.ItemPrice
  END) as EffectivePrice`)

const productFields =  [
  'Products.ID as ProductID',
  'Qty',
  'Products.ItemID as ItemID',
  'Products.ItemName as ItemName',
  'Description',
  'Products.ItemPrice as ItemPrice',
  effectivePriceCase,
  'Thumbnail',
  'Image',
  'Hyperlinked_Image as hyperlinkedImage',
  'SalePrice',
  'Sale_Start',
  'Sale_Stop',
  'Price1',
  'Price2',
  'Price3',
  'Price4',
  'Price5',
  'Price6',
  'Price7',
  'Price8',
  'Price9',
  'Price10',
  'Option1',
  'Option2',
  'Option3',
  'Option4',
  'Option5',
  'Option6',
  'Option7',
  'Option8',
  'Option9',
  'Option10',
  'Category.Category as Category',
  'Category.ID as CategoryId',
  'Subcategory.Subcategory as Subcategory',
  'Subcategory.ID as SubcategoryId',
  'CategoryB',
  'SubCategoryB',
  'CategoryC',
  'SubCategoryC',
  'Keywords',
]

const sw = require ('stopword');

const SearchTokens = (searchPhrase) => {
  // todo support ""?
  const withStopwords = (searchPhrase || '').split(' ')
  const noStopwords = sw.removeStopwords(withStopwords)
  return noStopwords
}

/**
  Creates a query s.t. it SELECT's productFields + relevance (semantic meaning) based on searchPhrase and filters
 */
const buildSearchQuery = (builder, { categoryId, subcategoryId, searchPhrase, onSaleOnly, newOnly, priceRange }) => {
  const now = new Date().toISOString()

  const makeQuery = (weight) => {
    let q = builder;

    q = q.select(knex.raw(`${weight} as relevance`), 'Products.ID')
    q = q.from('Products').where('Active', 1).whereNotNull('Products.Category')

    if (categoryId) {
      q = q.where(builder => builder
        .orWhere('Products.Category', categoryId)
        .orWhere('Products.CategoryB', categoryId)
        .orWhere('Products.CategoryC', categoryId)
      )
    }

    if (subcategoryId) {
      q = q.where(builder => builder
        .orWhere('Products.SubCategory', subcategoryId)
        .orWhere('Products.SubCategoryB', subcategoryId)
        .orWhere('Products.SubCategoryC', subcategoryId)
      )
    }

    if (onSaleOnly) {
      q = q.where('SalePrice', '>', 0)
           .where('Sale_Start', '<=', now)
           .where('Sale_Stop', '>=', now)
    }

    if (newOnly) {
      q = q.where('Added', '>=', new Date(Date.now() - 1000 * 60 * 60 * 24 * 60))
    }

    return q
  }

  const SearchAllFields = (searchPhrase) => {
    return [
        makeQuery(100).where('Products.ItemID', searchPhrase),
        makeQuery(40).where('Products.ItemName', 'like', `% ${searchPhrase}%`),
        makeQuery(10).where('Products.Keywords', 'like', `% ${searchPhrase}%`),
        makeQuery(4).where('Products.Description', 'like', `% ${searchPhrase}%`),
    ]
  }

  // save work b/c we don't need to do a regex
  const tokens = SearchTokens(searchPhrase)
  if (!searchPhrase || tokens.length == 0) {
    return makeQuery(1)
  } else {
    const queries = tokens.map(SearchAllFields).reduce((a, b) => a.concat(b), [])
    let unionQ = queries.reduce((a, b) => a.unionAll(b)).as('Search_inner')
    return builder.select('ID')
                  .sum('relevance as relevance')
                  .from(unionQ)
                  .groupBy('ID')
  }
}

class MyDB extends SQLDataSource {
  constructor() {
    super()
    this.knex = knex
  }

  async getWishList(uid) {
    if (!uid) throw new Error('uid is required')
    return await this.db.select(['WishList.Date as AddedDate', 'WishList.ID as WishListID'].concat(productFields))
      .from('WishList')
      .where('AccountID', uid)
      .innerJoin('Products', 'WishList.ItemID', 'Products.ID')
      .innerJoin('Category', 'Products.Category', 'Category.ID')
      .innerJoin('Subcategory', 'Products.SubCategory', 'Subcategory.ID')
  }

  async isInWishlist(uid, productId) {
    if (!uid) throw new Error('uid is required')
    if (!productId) throw new Error('productId is required')
    const result = await this.db.select('ID')
      .from('WishList')
      .where('AccountID', uid)
      .where('ItemID', productId)
      .first()
    return !!result
  }

  async addToWishList(uid, productId) {
    if (!uid) throw new Error('uid is required')
    if (!productId) throw new Error('productId is required')
    // TODO: fix this race condition
    const isInWishlist = await this.isInWishlist(uid, productId)
    if (isInWishlist) return
    await this.db('WishList').insert({ AccountID: uid, ItemID: productId })
  }

  async removeFromWishList(uid, productId) {
    if (!uid) throw new Error('uid is required')
    if (!productId) throw new Error('productId is required')
    await this.db('WishList').where({ AccountID: uid, ItemID: productId }).limit(1).del()
  }

  async getPromo(coupon_code) {
    if (!coupon_code)
      throw new Error('coupon_code required')
    else
      return await this.db.select('*').from('Promotions')
        .where('Coupon', coupon_code)
        .where('Starts', '<=', new Date())
        .where('Ends', '>=', new Date())
  }

  getCategory(categoryId) {
    if (!categoryId) return Promise.reject(`categoryId is required`)

    const query = this.db
      .select(categoryFields)
      .from('Category')
      .where('Category.ID', categoryId)

    return query
  }

  listCategories() {
    const query = this.db
      .select(categoryFields)
      .from('Category')
      .where('Category.Category', 'like', '%-%')
      .orderBy('Category.Category', 'ASC')

    return query
  }

  listSaleCategories() {
    const now = new Date().toISOString()
    let makeSaleQuery = (fieldName) => (
      this.db.select(fieldName + ' as ID')
        .from('Products')
        .where('Active', 1)
        .where('SalePrice', '>', 0)
        .where('Sale_Start', '<=', now)
        .where('Sale_Stop', '>=', now)
    )

    const inner = makeSaleQuery('Category')
      .union(makeSaleQuery('CategoryB'))
      .union(makeSaleQuery('CategoryC'))

    const query = this.db.select(categoryFields)
      .from('Category')
      .innerJoin(inner.as('t1'), 'Category.ID', 't1.ID')
      .orderBy('Category.Category', 'ASC')

    return query
  }

  listSubcategories(categoryId) {
    let query = this.db
      .select('Subcategory.ID as ID', 'Subcategory.Subcategory as Category', 'Comments')
      .from('Subcategory')
      .orderBy('Subcategory.Subcategory', 'ASC')
    if (categoryId)
      query = query.where('Subcategory.Category', '=', categoryId)
    return query
  }

  insertProduct(productData) {
    if (!productData) return Promise.reject(`productData is required`)
    return this.db('Products').insert(productData)
  }

  updateProduct(productId, productData) {
    if (!productId || !productData) return Promise.reject(`productId and productData are required`)
    return this.db('Products')
      .where('Products.ID', productId)
      .limit(1)
      .update(productData)
  }

  getProduct(productId) {
    if (!productId) return Promise.reject(`productId is required`)
    const query = this.db.select(productFields)
    .from('Products')
    .where('Products.ID', productId)
    .leftJoin('Category', 'Products.Category', 'Category.ID')
    .leftJoin('Subcategory', 'Products.SubCategory', 'Subcategory.ID')
    return query
  }

  listProducts(args) {
    args = validateArgs(args)

    const searchQuery = buildSearchQuery(this.db, args).as('Search')
    console.log('listProducts', searchQuery.toString())

    let dataQuery =  this.db.select(productFields)
      .from(searchQuery.clone())
      .innerJoin('Products', 'Search.ID', 'Products.ID')
      .innerJoin('Category', 'Products.Category', 'Category.ID')
      .innerJoin('Subcategory', 'Products.SubCategory', 'Subcategory.ID')
      .offset(args.skip)
      .limit(args.limit)

    if (args.sort == 'alpha') {
      dataQuery = dataQuery.orderBy('ItemName', 'asc')
    }
    else if (args.sort == 'mostRecent') {
      dataQuery = dataQuery.orderBy('Products.ID', 'desc')
    }
    else if (args.sort == 'priceAsc') {
      dataQuery = dataQuery.orderBy('EffectivePrice', 'asc')
    }
    else if (args.sort == 'priceDesc') {
      dataQuery = dataQuery.orderBy('EffectivePrice', 'desc')
    }
    else if (args.sort == 'random') {
      dataQuery = dataQuery.orderByRaw(process.env.SQL_ENGINE == 'mssql' ? 'NEWID()' : process.env.SQL_ENGINE == 'mysql' ? 'RAND()' : 'RANDOM()')
    }
    // relevance by default
    else {
      dataQuery = dataQuery
        .orderBy('relevance', 'desc')
        .orderBy('ItemName', 'asc')
    }

    const countQuery = this.db.count('* as nRecords').from(searchQuery.clone())

    const categoryInner = this.db.select('Category')
      .from(searchQuery.clone())
      .innerJoin('Products', 'Search.ID', 'Products.ID')

    const categoryQuery = this.db.select(categoryFields)
      .from('Category')
      .innerJoin(categoryInner.as('t1'), 't1.Category', 'Category.ID')
      .distinct()

    return Promise.all([ dataQuery, countQuery, categoryQuery ])
  }

  tryUpsertUser(email, user) {
    return this.findUser(email).then((result) => {
      if (result) {
        return Promise.reject(new Error('User already exists'))
      } else {
        return this.db('CustomerAccounts').insert(user)
      }
    })
  }

  findUserById(uid) {
    if (!uid) throw new Error('uid is required')
    return this.db.select('*')
      .from('CustomerAccounts')
      .where('ID', uid)
      .first()
  }

  findUser(email) {
    return this.db.select('*')
      .from('CustomerAccounts')
      .where('Email', email)
      .first()
  }

  updateUser(uid, patch) {
    if (!uid) throw new Error('uid is required')
    return this.db('CustomerAccounts')
      .where('ID', uid)
      .limit(1)
      .update(patch)
  }

  nextCartNumber() {
      return this.db.select('CustomerID').from('Cart').orderBy('CustomerID', 'DESC').first().then((r) =>
        r && r.CustomerID && (Number.parseInt(r.CustomerID) + 1)
      )
  }

  listCartItems(cartId) {
    return this.db.select(cartItemFields.concat(productFields))
      .from('Cart')
      .leftJoin('Products', 'Products.ID', 'Cart.ProductID')
      .leftJoin('Category', 'Products.Category', 'Category.ID')
      .leftJoin('Subcategory', 'Products.SubCategory', 'Subcategory.ID')
      .where('CustomerID', cartId)
  }

  async getCartItem(cartItemId) {
    if (!cartItemId) {
      throw new Error('cartItemId not set')
    }
    return await this.db.select('*').from('Cart').where('ID', cartItemId).first()
  }

  insertCartItem(cartId, qty, productId, variant) {
    const self = this
    return self.getProduct(productId).then((product) => {
      if (!product || product.length == 0) {
        return Promise.reject(new Error('Product does not exist'));
      }
      else {
        product = product[0]
        const q = this.db('Cart').insert({
          CustomerID: cartId,
          ProductID: productId,
          Quantity: qty,
          ItemID: product.ItemID,
          ItemName: product.ItemName,
          ItemPrice: product.ItemPrice,
          Subtotal: product.ItemPrice,
          Option: variant || '',
          Handling_Charge: 0,
        })
        return q.then(() => {
          return self.listCartItems(cartId)
        })
      }
    })
  }

  updateCartItem(cartItemId, qty, variant) {
    if (cartItemId) {
      return this.getCartItem(cartItemId).then((result) => {
        if (!result) {
          return Promise.reject(new Error('Invalid cart item id'))
        } else if (result.ID != cartItemId) {
          return Promise.reject(new Error('Cart item did not match ID'))
        }
        else {
          return this.db('Cart').where('ID', result.ID).update({ Quantity: qty, Option: variant || '' }).limit(1).then(() => result.CustomerID)
        }
      })
    } else {
      return Promise.reject(new Error('Invalid cart item id'))
    }
  }

  deleteCartItem(cartItemId) {
    if (cartItemId) {
      return this.getCartItem(cartItemId).then((result) => {
        if (!result) {
          return Promise.reject(new Error('Invalid cart item id'))
        }
        else if (result.ID != cartItemId) {
          return Promise.reject(new Error('Cart item did not match ID'))
        }
        else {
          return this.db('Cart').where('ID', result.ID).limit(1).del().then(() => result.CustomerID)
        }
      })
    } else {
      return Promise.reject(new Error('Invalid cart item id'))
    }
  }

  placeOrder(orderData) {
    return this.db('CustomerInfo').insert(orderData)
  }

  getCustomerInfo(orderId) {
    return this.db.select('*').from('CustomerInfo').where('CustomerID', orderId).first()
  }

  getTaxTables() {
    return this.db.select('*').from('TaxTables')
  }
}

exports.MyDB = MyDB

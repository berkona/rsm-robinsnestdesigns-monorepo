const { GraphQLScalarType } = require('graphql')
const { Kind } = require('graphql/language')
const paypal = require('@paypal/checkout-server-sdk')
const paypalClient = require('./paypal')
const ProductList = require('./ProductList')
const sendEmail = require('./email')
const reduceAllCategories = require('./reduceAllCategories')
const reduceProduct = require('./reduceProduct')
const reduceCategory = require('./reduceCategory')
const reduceUser = require('./reduceUser')
const reduceCartItem = require('./reduceCartItem')
const reduceWishList = require('./reduceWishList')
const reducePromo = require('./reducePromo')
const reduceOrder = require('./reduceOrder')
const signS3Url = require('./signS3Url')
const searchEngine = require('./searchEngine')
const { isOnSale } = require('./utils')
const {
  generateAuthToken,
  verifyAuthToken,
  register,
  signin,
  getUserFromToken,
} = require('./auth')

// Provide resolver functions for your schema fields
module.exports = exports = {}

const addToCart = async (obj, args, context) => {
  let cartId = args.orderId
  const productId = args.productId
  const qty = args.qty

  if (qty < 1) {
    return Promise.reject(new Error('Invalid Quantity'))
  }

  if (!cartId) {
    cartId = await context.dataSources.db.nextCartNumber()
  }

  let order = await getOrder(context.dataSources.db, cartId)
  if (order.placed)
    throw new Error('Order is not modifiable')

  let [ product ] = await context.dataSources.db.getProduct(productId)
  if (!product) throw new Error('Product does not exist')
  product = reduceProduct(product)

  let variant = args.variant
  if (variant) {
    variant = product.productVariants.filter((x) => x.id == variant)[0]
    if (!variant) throw new Error('Invalid variant id')
    variant = variant.text
  }
  const rows = await context.dataSources.db.insertCartItem(cartId, qty, productId, variant)
  order = await reduceOrder(cartId, rows)
  return order
}

async function updateCartItem(obj, { cartItemId, qty, variant }, context) {
    if (!cartItemId || !qty || qty < 1) {
      throw new Error('Invalid arguments');
    } else {
      const cartItem = await context.dataSources.db.getCartItem(cartItemId)
      if (!cartItem) throw new Error('Cart item not found')
      const cartId = cartItem.CustomerID
      if (variant) {
        const productId = cartItem.ProductID
        let [ product ] = await context.dataSources.db.getProduct(productId)
        if (!product) throw new Error('Product does not exist')
        product = reduceProduct(product)
        let variantId = variant
        variant = product.productVariants.filter(x => x.id == variantId).map(x => x.text)[0]
        if (!variant) throw new Error('Invalid variant id')
      }
      await context.dataSources.db.updateCartItem(cartItemId, qty, variant)
      const rows = await context.dataSources.db.listCartItems(cartId)
      return reduceOrder(cartId, rows)
    }
}

const removeFromCart = (obj, args, context) => {
  const cartItemId = args.cartItemId
  if (cartItemId) {
    return context.dataSources.db.deleteCartItem(cartItemId).then((cartId) => {
      return context.dataSources.db.listCartItems(cartId)
        .then((rows) => reduceOrder(cartId, rows))
    })
  } else {
    return Promise.reject(new Error('Invalid cartItemId'))
  }
}

async function placeOrder(obj, { orderId, paypalOrderId, shipping, county, promo }, context) {
  if (!orderId || !paypalOrderId || !shipping) {
    throw new Error('invalid arguments')
  }

  let order = await getOrder(context.dataSources.db, orderId, shipping, county, promo)

  let {
    placed,
    subtotal,
    tax,
    total,
  } = order
  let realShipping = order.shipping

  if (placed) {
    throw new Error('Order already placed')
  }

  // get paypal order details
  const paypalOrder = await getPaypalOrder(paypalOrderId)

  if (order.total != paypalOrder.amount) {
    throw new Error('paypalOrder does not match order amount -- refund paypal order');
  }

  let {
    name,
    email_address,
    phone,
    address,
  } = paypalOrder.payer

  phone = phone && phone.phone_number

  let {
    address_line_1,
    address_line_2,
    admin_area_2,
    admin_area_1,
    postal_code,
    country_code,
  } = address

  let orderShipping = paypalOrder.purchase_units[0].shipping

  address_line_1 = address_line_1 || orderShipping.address.address_line_1
  address_line_2 = address_line_2 || orderShipping.address.address_line_2
  admin_area_2 = admin_area_2 || orderShipping.address.admin_area_2
  admin_area_1 = admin_area_1 || orderShipping.address.admin_area_1
  postal_code = postal_code || orderShipping.address.postal_code
  country_code = country_code || orderShipping.address.country_code

  let sFirstName = orderShipping.name.full_name.split(' ')[0]
  let sLastName = orderShipping.name.full_name.split(' ')[1]
  let shippingAddress = orderShipping.address
  let shippingAddressLine = shippingAddress.address_line_1 + ' ' + (shippingAddress.address_line_2 || '')
  let shippingCity = shippingAddress.admin_area_2
  let shippingState = shippingAddress.admin_area_1
  let shippingZip = shippingAddress.postal_code
  let shippingCountryCode = shippingAddress.country_code

  const customerInfo = {
    CustomerId: orderId,
    OrderPlaced: 1,
    OrderFilled: 0,
    FirstName: sFirstName,
    LastName: sLastName,
    Phone: phone,
    Email: email_address,
    Address: shippingAddressLine,
    City: shippingCity,
    State: shippingState,
    Zip: shippingZip,
    Country: shippingCountryCode,
    BFirstName: name && name.given_name,
    BLastName: name && name.surname,
    BAddress: address_line_1 + ' ' + (address_line_2 || ''),
    BCity: admin_area_2,
    BState: admin_area_1,
    BZip: postal_code,
    BCountry: country_code,
    BPhone: phone,
    BEmail: email_address,
    Subtotal: subtotal,
    SalesTax: tax,
    Shipping: realShipping,
    Total: total,
    Coupon: promo,
    Discount: order.discount || 0.00,
    CardType: 'Paypal',
    Paypal: 1,
    PaypalComplete: 1,
  }
  await context.dataSources.db.placeOrder(customerInfo)
  order = await getOrder(context.dataSources.db, orderId)

  // post-order actions

  // remove each item bought from stock
  for (let i = 0; i < order.items.length; i++) {
    let lineItem = order.items[i]
    // determine if product is in-stock or not
    if (lineItem.product.qtyInStock && lineItem.product.qtyInStock > 0) {
      let newQty = lineItem.product.qtyInStock - lineItem.qty
      if (newQty < 0) {
        newQty = 0
        // TODO: do something about this?
        console.error('Order No ' + order.id + ' had line item qty ' + lineItem.qty + ' for product id ' + lineItem.product.id + ' but only ' + lineItem.product.qtyInStock + ' were in stock')
      }
      let patch = { Qty: newQty }
      if (lineItem.product.clearance && newQty == 0) {
        patch.Active = 0;
      }
      await context.dataSources.db.updateProduct(lineItem.product.id, patch)
    }
  }

  // remove promo used if single use
  if (promo && Number.parseFloat(order.discount) > 0) {
    const promoObj = await context.dataSources.db.getPromo(promo)
    if (promoObj.SingleUse) {
      await context.dataSources.db.deletePromo(promoObj.ID)
    }
  }

  // send email to admin & user
  const orderLink = process.env.SITE_URL + 'order/' + orderId

  await sendEmail({
    from: "Robin's Nest Designs <postmaster@mg.robinsnestdesigns.com>",
    to: "robin@robinsnestdesigns.com",
    subject: "Order Placed",
    text: 'A new order has been placed.  See: ' + orderLink,
  })

  await sendEmail({
    from: "Robin's Nest Designs <postmaster@mg.robinsnestdesigns.com>",
    to: email_address,
    subject: "Your Order with Robin's Nest Designs",
    template: "order-placed",
    'v:customerFirstName':  (name && name.given_name) || sFirstName,
    'v:orderNo': orderId,
    'v:orderDate': new Date().toLocaleDateString(),
    'v:orderLink': orderLink,
  })

  return order
}

async function getOrder(db, orderId, shipping, county, coupon_code) {
  const rows = await db.listCartItems(orderId)
  let promo = null
  if (coupon_code)
    promo = await db.getPromo(coupon_code)

  const order = reduceOrder(orderId, rows, shipping, county, promo)
  const cInfo = await db.getCustomerInfo(orderId)
  if (cInfo) {
    order.placed = true
    order.subtotal = cInfo.Subtotal
    order.tax = cInfo.SalesTax
    order.shipping = cInfo.Shipping
    order.total = cInfo.Total
    order.customerInfo = cInfo
  }
  return order
}

async function getPaypalOrder(paypalOrderId) {
  let req = new paypal.orders.OrdersGetRequest(paypalOrderId)
  let response = await paypalClient.execute(req)
  if (response.statusCode != 200) {
    throw new Error('Paypal API error ' + response.result)
  }
  const result = response.result
  if (!result) {
    throw new Error('Paypal api returned nothing')
  }
  if (result.intent != "CAPTURE") {
    throw new Error('Invalid order intent')
  }
  if (result.status != "COMPLETED") {
    throw new Error('Order status was not completed')
  }
  if (!result.purchase_units || !Array.isArray(result.purchase_units) || result.purchase_units.length != 1 || !result.purchase_units[0].amount || !result.purchase_units[0].amount.value) {
    throw new Error('Order did not have purchase units')
  }

  return Object.assign({}, result, {
    amount: result.purchase_units[0].amount.value,
  })
}

const getImage = async (db, storeGetFn, storeSetFn, listProductsArgs) => {
  let image = await storeGetFn()
  if (image) return image
  const [ { nRecords } ] = await db.listProductsTotal(listProductsArgs)
  for (let skip = 0; skip < nRecords; skip += 50) {
    const products = await db.listProducts(Object.assign({ skip }, listProductsArgs))
    const product = products.map(reduceProduct).filter(p => p && p.hyperlinkedImage)[0]
    image = product && product.hyperlinkedImage
    if (image) {
      await storeSetFn(image)
      return image
    }
  }
  return null
}

const resolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue: (value) => {
      return new Date(value); // value from the client
    },
    serialize: (value) => {
      return value.getTime(); // value sent to the client
    },
    parseLiteral: (ast) => {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value) // ast value is always in string format
      }
      return null;
    },
  }),
  Category: {
    image: (obj, args, { dataSources: { db } }) => getImage(
      db,
      () =>  db.getCategoryImage(obj.id),
      (image) => db.updateCategory(obj.id, { image, }),
      {
        categoryId: obj.id,
        sortOrder: 'mostRecent',
      }
    ),
  },
  SubCategory: {
    image: async (obj, args, { dataSources: { db } }) => getImage(
      db,
      () =>  db.getSubcategoryImage(obj.id),
      (image) => db.updateSubcategory(obj.id, { image, }),
      {
        subcategoryId: obj.id,
        sortOrder: 'mostRecent',
      }
    ),
  },
  ProductList,
  Query: {
    category: (obj, args, context) => context.dataSources.db.getCategory(args.categoryId).then(x => reduceCategory(x[0])),
    allCategories: (obj, args, context) => context.dataSources.db.listCategories().then(reduceAllCategories),
    allSubcategories: (obj, args, context) => context.dataSources.db.listSubcategories(args.categoryId).then(reduceAllCategories),
    product: (obj, args, context) => context.dataSources.db.getProduct(args.productId).then(x => {
      if (!x || x.length == 0) return Promise.reject(new Error('Product does not exist'))
      return reduceProduct(x[0])
    }),
    allProducts: (obj, args, context) => { return { args } },
    saleCategories: (obj, args, context) => context.dataSources.db.listSaleCategories().then(reduceAllCategories),
    cart: (obj, args, context) => getOrder(context.dataSources.db, args.orderId, args.shipping, args.county, args.promo),
    user: async (obj, { token }, context) => {
      const user = await getUserFromToken(token, context.dataSources.db)
      return user
    },
    wishlist: async (obj, { token }, context) => {
      const { uid } = verifyAuthToken(token)
      const wlRows = await context.dataSources.db.getWishList(uid)
      const wishList = reduceWishList(wlRows)
      return wishList
    },
    allPromos: async (obj, { token }, context) => {
      const payload = verifyAuthToken(token)
      // admin only
      if (!payload.a) throw new Error('Not authorized')
      const promos = await context.dataSources.db.listPromos()
      return promos.map(reducePromo)
    }
    // isInWishlist: (obj, { token, productId }, context) => context.dataSources.db.isInWishlist(verifyAuthToken(token).uid, productId),
  },
  Mutation: {
    signin,
    register,
    addToCart,
    updateCartItem,
    removeFromCart,
    placeOrder,
    updateUser: async (obj, { token, user }, context) => {
      const payload = verifyAuthToken(token)
      const uid = payload.uid
      await context.dataSources.db.updateUser(uid, {
        FirstName: user.firstName,
        LastName: user.lastName,
        Address: user.address,
        City: user.city,
        State: user.state,
        Zip: user.zip,
        Country: user.country,
        Phone: user.phone,
      })
      const userRow = await context.dataSources.db.findUserById(uid)
      if (!userRow) throw new Error('user does not exist')
      const output = reduceUser(userRow)
      return output
    },
    addToWishList: (obj, { token, productId }, context) => context.dataSources.db.addToWishList(verifyAuthToken(token).uid, productId),
    removeFromWishList: (obj, { token, productId }, context) => context.dataSources.db.removeFromWishList(verifyAuthToken(token).uid, productId),
    requestSignedUrl: async (obj, { token, fileName, fileType }, context) => {
      const payload = verifyAuthToken(token)
      // admin only
      if (!payload.a) throw new Error('Not authorized')
      const uuidv4 = require('uuid/v4');
      const parts = fileName.split('.')
      if (parts.length < 2) throw new Error('no file extension detected')
      fileName = uuidv4() + '.' + parts[parts.length-1]
      return await signS3Url(fileName, fileType)
    },
    createProduct: async(obj, { token, productData }, context) => {
      const payload = verifyAuthToken(token)
      // admin only
      if (!payload.a) throw new Error('Not authorized')

      const patch = {
        Active: true,
        ItemID: productData.sku,
        ItemName: productData.name,
        ItemPrice: productData.price,
        SalePrice: productData.salePrice,
        Qty: productData.qtyInStock,
        Sale_Start: productData.saleStart && new Date(Number.parseInt(productData.saleStart)).toISOString(),
        Sale_Stop: productData.saleEnd && new Date(Number.parseInt(productData.saleEnd)).toISOString(),
        Description: productData.description || null,
        Hyperlinked_Image: productData.hyperlinkedImage || null,
        Category: productData.categoryId,
        SubCategory: productData.subcategoryId,
        CategoryB: productData.category2 || null,
        SubCategoryB: productData.subcategory2 || null,
        CategoryC: productData.category3 || null,
        SubCategoryC: productData.subcategory3 | null,
        Keywords: productData.keywords || null,
        Added: new Date(),
      }

      const fields = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
      fields.forEach(pos => {
        const priceFieldName = 'Price' + pos
        const textFieldName = 'Option' + pos
        let variant = {
          price: 0.00,
          text: '',
        }
        if (productData.productVariants) {
          variant = productData.productVariants[pos-1] || variant
        }
        patch[priceFieldName] = variant.price
        patch[textFieldName] = variant.text
      })

      console.log('insertProduct', patch)
      const result = await context.dataSources.db.insertProduct(patch)
      console.log('insertProduct result',result)
      const [ resultId ] = result
      const [ row ] = await context.dataSources.db.getProduct(resultId)
      const product = reduceProduct(row)

      // we have to get extra data
      const getTitle = async (fn) => {
        const [ result ] = await fn()
        return result && result.Category
      }

      if (product.category2)
        product.category2 = await getTitle(() => context.dataSources.db.getCategory(product.category2))
      if (product.category3)
        product.category3 = await getTitle(() => context.dataSources.db.getCategory(product.category3))
      if (product.subcategory2)
        product.subcategory2 = await getTitle(() => context.dataSources.db.getSubcategory(product.subcategory2))
      if (product.subcategory3)
        product.subcategory3 = await getTitle(() => context.dataSources.db.getSubcategory(product.subcategory3))

      await searchEngine.add(product)
      return product
    },
    updateProduct: async(obj, { token, productId, productData }, context) => {
      const payload = verifyAuthToken(token)
      // admin only
      if (!payload.a) throw new Error('Not authorized')

      const patch = {
        ItemID: productData.sku,
        ItemName: productData.name,
        ItemPrice: productData.price,
        SalePrice: productData.salePrice,
        Qty: productData.qtyInStock,
        Sale_Start: new Date(Number.parseInt(productData.saleStart)).toISOString(),
        Sale_Stop: new Date(Number.parseInt(productData.saleEnd)).toISOString(),
        Description: productData.description,
        Hyperlinked_Image: productData.hyperlinkedImage,
        Category: productData.categoryId,
        SubCategory: productData.subcategoryId,
        CategoryB: productData.category2,
        SubCategoryB: productData.subcategory2,
        CategoryC: productData.category3,
        SubCategoryC: productData.subcategory3,
        Keywords: productData.keywords,
      }

      const fields = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
      fields.forEach(pos => {
        const priceFieldName = 'Price' + pos
        const textFieldName = 'Option' + pos
        let variant = {
          price: 0.00,
          text: '',
        }
        if (productData.productVariants) {
          variant = productData.productVariants[pos-1] || variant
        }
        patch[priceFieldName] = variant.price
        patch[textFieldName] = variant.text
      })

      console.log('updateProduct', productId, patch)
      await context.dataSources.db.updateProduct(productId, patch)
      const [ row ] = await context.dataSources.db.getProduct(productId)
      const product = reduceProduct(row)

      // we have to get extra data
      const getTitle = async (fn) => {
        const [ result ] = await fn()
        return result && result.Category
      }

      if (product.category2)
        product.category2 = await getTitle(() => context.dataSources.db.getCategory(product.category2))
      if (product.category3)
        product.category3 = await getTitle(() => context.dataSources.db.getCategory(product.category3))
      if (product.subcategory2)
        product.subcategory2 = await getTitle(() => context.dataSources.db.getSubcategory(product.subcategory2))
      if (product.subcategory3)
        product.subcategory3 = await getTitle(() => context.dataSources.db.getSubcategory(product.subcategory3))

      await searchEngine.remove(product.id)
      await searchEngine.add(product)
      return product
    },
    removeProduct: async (obj, { token, productId }, context) => {
      const payload = verifyAuthToken(token)
      // admin only
      if (!payload.a) throw new Error('Not authorized')
      const [ row ] = await context.dataSources.db.getProduct(productId)
      if (!row) throw new Error('product does not exist')
      await context.dataSources.db.updateProduct(productId, { Active: 0 })
      await searchEngine.remove(productId)
    },
    addCategory: async(obj, { token, category }, context) => {
      const payload = verifyAuthToken(token)
      // admin only
      if (!payload.a) throw new Error('Not authorized')
      const [ categoryId ] = await context.dataSources.db.insertCategory(category)
      const [ row ] = await context.dataSources.db.getCategory(categoryId)
      return reduceCategory(row)
    },
    updateCategory: async(obj, { token, categoryId, category }, context) => {
      const payload = verifyAuthToken(token)
      // admin only
      if (!payload.a) throw new Error('Not authorized')
      await context.dataSources.db.updateCategory(categoryId, category)
      const [ row ] = await context.dataSources.db.getCategory(categoryId)
      return reduceCategory(row)
      // todo update searchEngine
    },
    addSubcategory: async (obj, { token, subcategory }, context) => {
      const payload = verifyAuthToken(token)
      // admin only
      if (!payload.a) throw new Error('Not authorized')
      const [ categoryId ] = await context.dataSources.db.insertSubcategory(subcategory)
      const [ row ] = await context.dataSources.db.getSubcategory(categoryId)
      return reduceCategory(row)
    },
    updateSubcategory: async( obj, { token, subcategoryId, subcategory }, context) => {
      const payload = verifyAuthToken(token)
      // admin only
      if (!payload.a) throw new Error('Not authorized')
      await context.dataSources.db.updateSubcategory(subcategoryId, subcategory)
      const [ row ] = await context.dataSources.db.getSubcategory(subcategoryId)
      return reduceCategory(row)
      // todo update searchEngine
    },
    addPromo: async (obj, { token, promo }, context) => {
      const payload = verifyAuthToken(token)
      // admin only
      if (!payload.a) throw new Error('Not authorized')
      const patch = {
        Coupon: promo.coupon,
        Starts: promo.starts,
        Ends: promo.ends,
        PriceBreak: promo.requiresTotal,
        MoneyOff: promo.moneyOff,
        PercentageOff: promo.percentageOff,
        FreeShipping: promo.freeShipping,
      }
      const [ id ] = await context.dataSources.db.insertPromo(patch)
      const row = await context.dataSources.db.getPromoById(id)
      return reducePromo(row)
    },
    updatePromo: async (obj, { token, promoId, promo }, context) => {
      const payload = verifyAuthToken(token)
      // admin only
      if (!payload.a) throw new Error('Not authorized')
      const patch = {
        Coupon: promo.coupon,
        Starts: promo.starts,
        Ends: promo.ends,
        PriceBreak: promo.requiresTotal,
        MoneyOff: promo.moneyOff,
        PercentageOff: promo.percentageOff,
        FreeShipping: promo.freeShipping,
      }
      await context.dataSources.db.updatePromo(promoId, patch)
      const row = await context.dataSources.db.getPromoById(id)
      return reducePromo(row)
    },
    removePromo: async (obj, { token, promoId }, context) => {
      const payload = verifyAuthToken(token)
      // admin only
      if (!payload.a) throw new Error('Not authorized')
      await context.dataSources.db.deletePromo(promoId)
    },
  },
  Product: {
    isOnSale: (obj, args, context) => isOnSale(obj),
  },
}

exports.resolvers = resolvers

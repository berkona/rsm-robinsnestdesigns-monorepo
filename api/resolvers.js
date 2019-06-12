const paypal = require('@paypal/checkout-server-sdk');
const paypalClient = require('./paypal')

// Provide resolver functions for your schema fields
module.exports = exports = {}

function reduceAllCategories(rows) {
  return rows.map(reduceCategory)
}

function conditionalPush(row, arr, id, priceField, optionField) {
  if (row[priceField]) {
    arr.push({
      id,
      price: Number.parseFloat(row[priceField]),
      text: row[optionField],
    })
  }
}
function reduceProduct(row) {
  const productVariants = []

  conditionalPush(row, productVariants, 1, 'Price1', 'Option1')
  conditionalPush(row, productVariants, 2, 'Price2', 'Option2')
  conditionalPush(row, productVariants, 3, 'Price3', 'Option3')
  conditionalPush(row, productVariants, 4, 'Price4', 'Option4')
  conditionalPush(row, productVariants, 5, 'Price5', 'Option5')
  conditionalPush(row, productVariants, 6, 'Price6', 'Option6')
  conditionalPush(row, productVariants, 7, 'Price7', 'Option7')
  conditionalPush(row, productVariants, 8, 'Price8', 'Option8')
  conditionalPush(row, productVariants, 9, 'Price9', 'Option9')
  conditionalPush(row, productVariants, 10, 'Price10', 'Option10')

  return {
    id: row.ProductID,
    sku: row.ItemID,
    qtyInStock: row.Qty || 0,
    name: row.ItemName,
    price: row.ItemPrice,
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
    hyperlinkedImage: row.hyperlinkedImage,
    productVariants,
  }
}

function reduceCategory(row) {
  return {
    id: row.ID,
    title: row.Category,
    comments: row.Comments,
  }
}

const reduceUser = (row) => {
  return {
    id: row.ID,
    email: row.Email,
    firstName: row.FirstName,
    lastName: row.LastName,
    address: row.Address,
    city: row.City,
    state: row.State,
    zip: row.Zip,
    country: row.Country,
    phone: row.Phone,
    businessEmail: row.BEmail,
    businessFirstName: row.BFirstName,
    businessLastName: row.BLastName,
    businessAddress: row.BAddress,
    businessCity: row.BCity,
    businessState: row.BState,
    businessZip: row.BZip,
    businessCountry: row.BCOuntry,
    businessPhone: row.BPhone,
  }
}

const reduceCartItem = (cartItem) => {
  return {
    id: cartItem.CartItemId,
    product: reduceProduct(cartItem),
    qty: cartItem.Quantity,
    variant: null,
  }
}

const TAX_REGEX = /^2(7|8)\d{3}$/
const TAXS_TMP = {
  'Durham': 7.5,
}
const DEFAULT_TAX_RATE = 7.0

const reduceOrder = (orderId, rows, shipping, zipcode, county) => {
  const items = rows.map(reduceCartItem)

  let subtotal = items.map((ci) => ci.product.price * ci.qty).reduce((a, b) => a + b, 0)
  subtotal = subtotal.toFixed(2)

  shipping = Number.parseFloat(subtotal) < 75 ? (shipping || '3.99') : '0.00'

  let tax = '0.00'
  if (zipcode && TAX_REGEX.test(zipcode)) {
    let taxRate = TAXS_TMP[county] || DEFAULT_TAX_RATE
    const taxableTotal = (Number.parseFloat(subtotal) + Number.parseFloat(shipping)).toFixed(2)
    tax = Number.parseFloat(taxableTotal) * (Number.parseFloat(taxRate) / 100.0)
    tax = tax.toFixed(2)
  }

  let total = Number.parseFloat(subtotal) + Number.parseFloat(shipping) + Number.parseFloat(tax)
  total = total.toFixed(2)

  return {
    id: orderId,
    placed: false,
    items,
    subtotal,
    shipping,
    tax,
    total,
  }
}

var jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'a test jwt secret';
const JWT_ISSUER = process.env.JWT_ISSUER || 'rsm-graphql-node';
const JWT_MAX_AGE = process.env.JWT_MAX_AGE || '14d';

const generateAuthToken = (userId) => {
  return jwt.sign({ uid: userId }, JWT_SECRET, { algorithm: 'HS256', expiresIn: JWT_MAX_AGE, issuer: JWT_ISSUER });
}

const verifyAuthToken = (token) => {
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'], issuer: JWT_ISSUER, maxAge: JWT_MAX_AGE })
}

const register = (obj, args, context) => {
  return context.dataSources.db.tryUpsertUser(args.email, args).then(() => login(obj, args, context))
}

const signin = (obj, args, context) => {
  return context.dataSources.db.findUser(args.email).then((user) => {
    if (!user) {
      return Promise.reject(new Error('User does not exist'));
    } else {
      // TODO upgrade password storage...
      if (args.password === user.Password) {
        return {
          token: generateAuthToken(),
          user: reduceUser(user),
        }
      } else {
        return Promise.reject(new Error('Username or password does not match'));
      }
    }
  })
}

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

  const rows = await context.dataSources.db.insertCartItem(cartId, qty, productId)
  order = await reduceOrder(cartId, rows)
  return order
}

const updateCartItem = (obj, { cartItemId, qty }, context) => {
    if (!cartItemId || !qty || qty < 1) {
      return Promise.reject(new Error('Invalid arguments'));
    } else {
      return context.dataSources.db.updateCartItem(cartItemId, qty).then((cartId) => {
        return context.dataSources.db.listCartItems(cartId)
          .then((rows) => reduceOrder(cartId, rows))
      })
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

async function placeOrder(obj, { orderId, paypalOrderId, shipping, zipcode, county }, context) {
  if (!orderId || !paypalOrderId || !shipping || !zipcode) {
    throw new Error('invalid arguments')
  }

  if (('' + zipcode).length != 5) {
    throw new Error('invalid zipcode')
  }

  const order = await getOrder(context.dataSources.db, orderId, shipping, zipcode, county)

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
    email,
    phone,
    address,
  } = paypalOrder.payer

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
    Email: email,
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
    BEmail: email,
    Subtotal: subtotal,
    SalesTax: tax,
    Shipping: realShipping,
    Total: total,
    Paypal: 1,
    PaypalComplete: 1,
  }
  await context.dataSources.db.placeOrder(customerInfo)
  return await getOrder(context.dataSources.db, orderId)
}

async function getOrder(db, orderId, shipping, zipcode, county) {
  const rows = await db.listCartItems(orderId)
  const order = reduceOrder(orderId, rows, shipping, zipcode, county)
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
        total: countRow[0].nRecords,
        skip: args.skip,
        limit: args.limit,
        records: rows.map(reduceProduct)
      }
    }),
    saleCategories: (obj, args, context) => context.dataSources.db.listSaleCategories().then(reduceAllCategories),
    cart: (obj, args, context) => getOrder(context.dataSources.db, args.orderId, args.shipping, args.zipcode, args.county)
  },
  Mutation: {
    signin,
    register,
    addToCart,
    updateCartItem,
    removeFromCart,
    placeOrder,
  }
}

exports.verifyAuthToken = verifyAuthToken
exports.resolvers = resolvers

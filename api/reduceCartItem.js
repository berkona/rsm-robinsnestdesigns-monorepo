const { isOnSale } = require('./utils')
const reduceProduct = require('./reduceProduct')

const reduceCartItem = (cartItem) => {
  const product = reduceProduct(cartItem)
  const variant = !cartItem.Option ? null
    : product.productVariants
      .filter(x => x.text == cartItem.Option)
      .map(x => x.id)[0]

  let price
  if (variant) {
    const variantObj = product.productVariants.filter(x => x.id == variant)[0]
    if (!variantObj) throw new Error('Invalid CartItem.variant in DB, did product change?')
    price =  variantObj.price
  } else if (isOnSale(product)) {
    price = product.salePrice
  } else {
    price = product.price
  }

  return {
    id: cartItem.CartItemId,
    qty: cartItem.Quantity,
    price,
    product,
    variant,
  }
}

module.exports = reduceCartItem

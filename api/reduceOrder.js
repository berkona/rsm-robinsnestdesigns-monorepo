const reduceCartItem = require('./reduceCartItem')

const TAX_REGEX = /^2(7|8)\d{3}$/
const TAXS_TMP = {
  'Durham': 7.5,
}
const DEFAULT_TAX_RATE = 7.0

const canApplyPromo = (promo, items, subtotal) => {
  return promo.PriceBreak == null || Number.parseFloat(subtotal) > promo.PriceBreak
}

const calcPromo = (promo, subtotal, shipping) => {
  if (promo.PercentageOff) {
    return ( Number.parseFloat(subtotal) * promo.PercentageOff ).toFixed(2)
  } else if (promo.FreeShipping) {
    return shipping || '0.00'
  } else {
    return promo.MoneyOff || '0.00'
  }
}

const reduceOrder = (orderId, rows, shipping, county, promo) => {
  const items = rows.map(reduceCartItem)

  let subtotal = items.map((ci) => ci.price * ci.qty).reduce((a, b) => a + b, 0)
  subtotal = subtotal.toFixed(2)

  shipping = Number.parseFloat(subtotal) < 75 ? (shipping || '3.99') : '0.00'

  let discount = '0.00'
  if (promo && canApplyPromo(promo, items, subtotal)) {
    discount = calcPromo(promo, subtotal, shipping) || '0.00'
  }

  const taxableTotal = (Number.parseFloat(subtotal) + Number.parseFloat(shipping) - Number.parseFloat(discount)).toFixed(2)

  let tax = '0.00'
  if (county) {
    let taxRate = TAXS_TMP[county] || DEFAULT_TAX_RATE
    tax = Number.parseFloat(taxableTotal) * (Number.parseFloat(taxRate) / 100.0)
    tax = tax.toFixed(2)
  }

  let total = Number.parseFloat(taxableTotal) + Number.parseFloat(tax)
  total = total.toFixed(2)

  return {
    id: orderId,
    placed: false,
    items,
    subtotal,
    shipping,
    discount,
    tax,
    total,
  }
}

module.exports = reduceOrder

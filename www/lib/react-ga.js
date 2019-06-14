import React from 'react'
import ReactGA from "react-ga";

const IS_BROWSER = typeof window !== "undefined";

export function initGA(code) {
  if (IS_BROWSER && !window.GA_INITIALIZED && code) {
    console.log('ReactGA.initGA', code)
    ReactGA.initialize(code);
    ReactGA.plugin.require('ec');
  }
}

let nwaiters = 0
function pageviewSignalWait() {
  nwaiters++
}

function pageviewSignalDone() {
  nwaiters--
  if (nwaiters == 0) pageview()
}

export function pageview() {
  setTimeout(() => {
    console.log('ReactGA.pageview')
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, 10);
}

export class PageViewEvent extends React.Component {
  constructor(props) {
    super()
    pageviewSignalWait()
  }

  componentDidMount() {
    pageviewSignalDone()
  }

  render() {
    return <></>
  }
}

export function event(category = "", action = "") {
  console.log('ReactGA.event', arguments)
  if (category && action) {
    ReactGA.event({ category, action });
  }
}

export function exception(description = "", fatal = false) {
  console.log('ReactGA.exception', arguments)
  if (description) {
    ReactGA.exception({ description, fatal });
  }
}

export class AddImpressionEvent extends React.Component {
  constructor(props) {
    super(props)
    pageviewSignalWait()
  }

  componentDidMount() {
    console.log('ReactGA.AddImpressionEvent.componentDidMount', this)
    addSingleImpressionEvent(this.props.listName, this.props, this.props.position)
    pageviewSignalDone()
  }

  render() {
    return <></>
  }
}

export function addSingleImpressionEvent(listName, product, idx) {
  ReactGA.ga('ec:addImpression', {
    'id': product.sku,                   // Product details are provided in an impressionFieldObject.
    'name': product.name,
    'category': product.category + '/' + product.subcategory,
    'list': listName,
    'position': idx                    // 'position' indicates the product position in the list.
  });
}

export function addImpressionsEvent(products, listName) {
  products.forEach(addSingleImpression.bind(null, listName))
  pageview()
}

export function productClickEvent(product, idx, listName) {
  console.log('ReactGA.productClickEvent', arguments)
  ReactGA.ga('ec:addProduct', {
    'id': product.sku,
    'name': product.name,
    'category': product.category + '/' + product.subcategory,
    'position': idx
  });
  ReactGA.ga('ec:setAction', 'click', { list: listName })

  // Send click with an event, then send user to product page.
  ReactGA.event({ category: 'UX', action: 'click', label: 'Results' })
}

function addProduct(product, qty, variant, price, listName) {
  console.log('ReactGA.addProduct', { product, qty, variant, price })
  ReactGA.ga('ec:addProduct', {
    id: product.sku,
    name: product.name,
    category: product.category + '/' + product.subcategory,
    variant: variant,
    price: price,
    quantity: qty,
    list: listName
  })
}

export function productDetailEvent(product) {
  console.log('ReactGA.productDetailEvent', arguments)
  addProduct(product)
  ReactGA.ga('ec:setAction', 'detail')
}

export class ProductDetailEvent extends React.Component {
  constructor(props) {
    super(props)
    pageviewSignalWait()
  }

  componentDidMount() {
    productDetailEvent(this.props.product)
    pageviewSignalDone()
  }

  render() {
    return <></>
  }
}

function doCartAction(product, qty, variant, price, type, listName) {
  addProduct(product, qty, variant, price, listName)
  ReactGA.ga('ec:setAction', type)
  ReactGA.event({ category: 'UX', action: 'click', label: 'Add to cart' })
}

export function addToCartEvent(product, qty, variant, price, listName) {
  console.log('ReactGA.addToCartEvent', arguments)
  doCartAction(product, qty, variant, price, 'add', listName)
}

export function removeFromCartEvent(product, qty, variant, price, listName) {
  console.log('ReactGA.removeFromCartEvent', arguments)
  doCartAction(product, qty, variant, price, 'remove', listName)
}

export function checkoutOpenCartEvent(cartItems) {
  console.log('ReactGA.checkoutOpenCartEvent', arguments)
  cartItems.forEach(({ product, qty, variant, price }) => addProduct(product, qty, variant, price))
  ReactGA.ga('ec:setAction', 'checkout', {
    step: 1
  })
  pageview()
}

export class CheckoutOpenCartEvent extends React.Component {
  constructor(props) {
    super(props)
    pageviewSignalWait()
  }

  componentDidMount() {
    if (process.browser) {
      checkoutOpenCartEvent(this.props.cartItems)
    }
    pageviewSignalDone()
  }

  render() {
    return <></>
  }
}

export function checkoutOpenPaypalEvent(cartItems) {
  console.log('ReactGA.checkoutOpenPaypalEvent', arguments)
  cartItems.forEach(({ product, qty, variant, price }) => addProduct(product, qty, variant, price))
  ReactGA.ga('ec:setAction', 'checkout', {
    step: 2
  })
  pageview()
}

export class CheckoutOpenPaypalEvent extends React.Component {
  constructor(props) {
    super(props)
    pageviewSignalWait()
  }

  componentDidMount() {
    if (process.browser) {
      checkoutOpenPaypalEvent(this.props.cartItems)
    }
    pageviewSignalDone()
  }

  render() {
    return <></>
  }
}

export function checkoutDoneEvent(cartItems, id, revenue, tax, shipping, coupon) {
  console.log('ReactGA.checkoutDoneEvent', arguments)
  cartItems.forEach(({ product, qty, variant, price }) => addProduct(product, qty, variant, price))
  ReactGA.ga('ec:setAction', 'purchase', {
    id,
    revenue,
    tax,
    shipping,
    coupon,
  })
  pageview()
}

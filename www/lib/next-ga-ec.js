import React from 'react'
import ReactGA from 'react-ga'
import Router from 'next/router'

/**
 * initialize GA
 */
export function initGA(code) {
  if (process.browser && window && !window.GA_INITIALIZED && code) {
    console.log('initGA', code)
    ReactGA.initialize(code);
    ReactGA.plugin.require('ec');
  }
}

export const Actions = {
  ProductClick: ({ sku, name, category, list, position }) => {
    const opts = {
      id: sku,
      name,
      category,
      list,
      position,
    }
    console.log('Actions.ProductClick', opts)
    ReactGA.ga('ec:addProduct', opts)
    ReactGA.ga('ec:setAction', 'click', { list, })
    ReactGA.event({ category: 'UX', action: 'click', label: 'Click on ' + list })
  },
  AddToCart: ({ sku, name, category, variant, price, qty, list, position }) => {
    const opts = {
      id: sku,
      name,
      category,
      variant,
      price,
      qty,
      list,
      position,
    }
    console.log('Actions.AddToCart', opts)
    ReactGA.ga('ec:addProduct', opts)
    ReactGA.ga('ec:setAction', 'add')
    ReactGA.event({ category: 'UX', action: 'click', label: 'Add to cart' })
  },
  RemoveFromCart: ({ sku, name, category, variant, price, qty, list, position }) => {
    const opts = {
      id: sku,
      name,
      category,
      variant,
      price,
      qty,
      list,
      position,
    }
    console.log('Actions.RemoveFromCart', opts)
    ReactGA.ga('ec:addProduct', opts)
    ReactGA.ga('ec:setAction', 'remove')
    ReactGA.event({ category: 'UX', action: 'click', label: 'Remove from cart' })
  },
}

const SEND_PAGE_VIEW_DEBOUNCE_DELAY = 250

/**
 * Send a page view to GA.  You should use this in an _app.js
 * Use Impression and Product components as children to add them to the page view
 */
export class PageView extends React.Component {

  static signalWait() {
    if (!process.browser) return;
    if (PageView.__semaphoreV === undefined)
      PageView.__semaphoreV = 0
    PageView.__semaphoreV++
  }

  static signalDone() {
    if (!process.browser) return;
    if (PageView.__semaphoreV === undefined)
      PageView.__semaphoreV = 0
    if (PageView.__semaphoreV === 0) {
      throw new Error('signalDone called more times than signalWait, check your code')
    }
    PageView.__semaphoreV--
    if (PageView.__semaphoreV === 0) {
      PageView.sendPageview()
    }
  }

  static sendPageview() {
    if (!PageView.__canSendPageView || !process.browser) return
    if (PageView.__sendDebounceTimeout !== undefined)
      clearTimeout(PageView.__sendDebounceTimeout)
    PageView.__sendDebounceTimeout = setTimeout(() => {
      console.log('PageView.sendPageview', window.location.pathname + window.location.search)
      ReactGA.pageview(window.location.pathname + window.location.search)
      PageView.__sendDebounceTimeout = undefined
    }, SEND_PAGE_VIEW_DEBOUNCE_DELAY)
  }

  routeChange(url) {
    console.log('PageView.routeChangeComplete', url)
    PageView.__canSendPageView = true
  }

  componentWillMount() {
    // console.log('PageView.componentWillMount')
    if (process.browser) {
      this.routeChange(Router.pathname)
      Router.events.on('routeChangeComplete', this.routeChange)
      PageView.signalWait()
    }
  }

  componentDidMount() {
    // console.log('PageView.componentDidMount')
    if (process.browser) {
      PageView.signalDone()
    }
  }

  render() {
    // console.log('PageView.render')
    return <>{this.props.children}</>
  }

  componentDidUpdate() {
    // console.log('PageView.componentDidUpdate')
  }

  componentWillUnmount() {
    console.log('PageView.componentWillUnmount')
    Router.events.off('routeChangeComplete', this.routeChange)
  }
}

/**
 * Equivalent to an ec:addImpression action

 Props:
 sku,
 name,
 category,
 list,
 position,

 */
export class Impression extends React.Component {
  componentWillMount() {
    if (process.browser) {
      const opts = {
        'id': this.props.sku,                   // Product details are provided in an impressionFieldObject.
        'name': this.props.name,
        'category': this.props.category,
        'list': this.props.list,
        'position': this.props.position                    // 'position' indicates the product position in the list.
      }
      console.log('Impression.addImpression', opts)
      ReactGA.ga('ec:addImpression', opts)
      PageView.signalWait()
    }
  }

  componentDidMount() {
    // console.log('Impression.componentDidMount')
    if (process.browser) {
        PageView.signalDone()
    }
  }

  componentDidUpdate() {
    // console.log('Impression.componentDidUpdate')
  }

  componentWillUnmount() {
    // console.log('Impression.componentWillUnmount')
  }

  render() {
    // console.log('Impression.render')
    return <>{this.props.children}</>
  }
}

/**
 * Equivalent to an ec:addProduct action

 Props:
 sku,
 name,
 category,
 variant,
 price,
 quantity,
 list,

 */
export class Product extends React.Component {
  componentWillMount() {
    if (process.browser) {
      const opts = {
        id: this.props.sku,
        name: this.props.name,
        category: this.props.category,
        variant: this.props.variant,
        price: this.props.price,
        quantity: this.props.qty,
        list: this.props.list
      }
      console.log('Product.addProduct', opts)
      ReactGA.ga('ec:addProduct', opts)
      PageView.signalWait()
    }
  }

  componentDidMount() {
    // console.log('Product.componentDidMount')
    if (process.browser) {
      PageView.signalDone()
    }
  }

  componentDidUpdate() {
    // console.log('Product.componentDidUpdate')
  }

  componentWillUnmount() {
    // console.log('Product.componentWillUnmount')
  }

  render() {
    // console.log('Product.render')
    return <>{this.props.children}</>
  }
}

export class ProductDetailAction extends React.Component {
  componentWillMount() {
    if (process.browser) {
      console.log('ProductDetailAction')
      ReactGA.ga('ec:setAction', 'detail')
      PageView.signalWait()
    }
  }

  componentDidMount() {
    if (process.browser) {
      PageView.signalDone()
    }
  }

  render() {
    return <></>
  }
}

export class CheckoutAction extends React.Component {
  componentWillMount() {
    if (process.browser) {
      console.log('CheckoutAction')
      ReactGA.ga('ec:setAction', 'checkout', { step: this.props.step })
      PageView.signalWait()
    }
  }
  componentDidMount() {
    if (process.browser) {
      PageView.signalDone()
    }
  }
  render() {
    return <></>
  }
}

export class Purchase extends React.Component {
  componentWillMount() {
    if (process.browser) {
      ReactGA.ga('ec:setAction', 'purchase', {
        id: this.props.transactionId,
        revenue: this.props.revenue,
        tax: this.props.tax,
        shipping: this.props.shipping,
        coupon: this.props.coupon,
      })
      PageView.signalWait()
    }
  }
  componentDidMount() {
    if (process.browser) {
      PageView.signalDone()
    }
  }
  render() {
    return <></>
  }
}

import React from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Collapse from 'react-bootstrap/Collapse'
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import Router from 'next/router'
import {FaSpinner, FaInfoCircle } from 'react-icons/fa'
import { CurrentUserContext } from '../lib/auth'
import { Actions } from '../lib/next-ga-ec'
import Alert from 'react-bootstrap/Alert'

const PRODUCT_QUERY = gql`
query($productId: ID!) {
  product(productId: $productId) {
    id
    sku
    name
    qtyInStock
    isOnSale
    price
    salePrice
    category
    subcategory
    productVariants {
      id
      price
      text
    }
  }
}
`

const getProductPrice = (product, variant) => variant
  ? product.productVariants.filter(x => x.id == variant)[0].price
  : product.isOnSale ? product.salePrice : product.price

const ADD_TO_CART = gql`
  mutation addToCart($productId: ID!, $qty: Int!, $orderId: ID, $variant: ID) {
    addToCart(productId: $productId, qty: $qty, orderId: $orderId, variant: $variant) {
      id
      subtotal
      items {
        id
        qty
        variant
        product {
          id
          sku
          name
          price
        }
      }
    }
  }
`

const UPDATE_CART = gql`
mutation updateCartItem($cartItemId: ID!, $qty: Int!, $variant: ID) {
  updateCartItem(cartItemId: $cartItemId, qty: $qty, variant: $variant) {
    id
    subtotal
    items {
      id
      qty
      variant
      product {
        id
        sku
        name
        price
      }
    }
  }
}
`

const CART_QUERY = gql`
query($orderId: ID!) {
  cart(orderId: $orderId) {
    id
    subtotal
    items {
      id
      qty
      variant
      product {
        id
        sku
        name
        price
      }
    }
  }
}
`

class AddToCart extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      quanityToAdd: undefined,
      hasFormSubmitted: false,
    }
  }

  render() {
    const self = this
    const productId = this.props.productId
    const range = (min, max) => {
      if (max < min) return range(max, min)
      let arr = []
      for (let i = min; i <= max; i++) {
        arr.push(i)
      }
      return arr
    }
    return (
      <CurrentUserContext.Consumer>
      { currentUser => {
        return <Query query={PRODUCT_QUERY} variables={{ productId }}>
          {({ loading, error, data }) => {
            if (loading) return <p>Loading...</p>
            if (error) return <p>Network error: {error.toString()}</p>

            const product = data.product
            const maxQuantity = product.qtyInStock || 25
            const price = getProductPrice(product, this.state.variant || product.productVariants.length > 0 && product.productVariants.map(x => x.id)[0])

            const cartForm = (changeText, defaultQty, defaultVariant) => (mutationFn, { loading, error, data }) => {
              if (error) {
                return <p>Error: {error.toString()}</p>
              }
              return (
                <Form onSubmit={() => {
                  event.preventDefault();
                  if (loading) {
                    return
                  }

                  if (!this.state.hasFormSubmitted) {
                    mutationFn();
                    self.setState({ hasFormSubmitted: true })
                  } else {
                    Router.push('/cart')
                  }
                }}>
                  <Collapse in={!this.state.hasFormSubmitted}>
                    <div>
                      { product.productVariants.length > 0 &&
                        <Form.Group controlId="cartVariant">
                          <Form.Label>Option</Form.Label>
                          <Form.Control as="select" onChange={() => this.setState({ variant: event.target.value })} value={this.state.variant || defaultVariant}>
                            {[...product.productVariants.sort((a, b) => a.price - b.price).map((variant) => <option key={variant.id} value={variant.id}>{variant.text} at ${variant.price.toFixed(2)} each</option>)]}
                          </Form.Control>
                        </Form.Group>
                      }
                      <Form.Group controlId="cartQuantity">
                        <Form.Label>Quantity</Form.Label>
                        <Form.Control as="select" onChange={() => this.setState({ quanityToAdd: event.target.value })} value={this.state.quanityToAdd || defaultQty || 1}>
                          {[...range(1, maxQuantity).map((qty) => <option key={qty} value={qty}>{qty}</option>)]}
                        </Form.Control>
                      </Form.Group>
                    </div>
                  </Collapse>
                  {
                    this.state.hasFormSubmitted
                      ? <Button variant="dark" type="submit" block>View Cart</Button>
                      : <Button variant="dark" type="submit" block disabled={loading}>
                        {
                          loading
                            && <><FaSpinner style={{ marginRight: '5px' }}/>Working...</>
                            || <>{changeText}</>
                        }
                      </Button>
                  }
                </Form>
              )
            }

            const addToCart = () => <Mutation
              mutation={ADD_TO_CART}
              variables={{
                productId: productId,
                orderId: currentUser.getCartId(),
                qty: Number.parseInt(this.state.quanityToAdd || 1),
                variant: this.state.variant || product.productVariants.map(x => x.id)[0],
              }}
              onCompleted={(data) => {
                if (!currentUser.getCartId() && data && data.addToCart && data.addToCart.id) {
                  console.log('setting cartId to ', data.addToCart.id)
                  currentUser.setCartId(data.addToCart.id)
                }
              }}
              update={(cache, { data }) => {
                cache.writeQuery({
                  query: CART_QUERY,
                  variables: { orderId: data && data.addToCart && data.addToCart.id },
                  data: { cart: data && data.addToCart }
                })
                Actions.AddToCart({ sku: product.sku, name: product.name, category: product.category + '/' + product.subcategory, variant: this.state.variant, qty: this.state.quanityToAdd || 1, price: price, list: self.props.listref })
              }}
              >
            {cartForm('Add To Cart')}
            </Mutation>

            if (!currentUser.getCartId()) {
              return addToCart()
            } else {
              return <Query query={CART_QUERY} variables={{ orderId: currentUser.getCartId() }}>
                {({ loading, error, data }) => {
                  if (error) {
                    return <p>Error: {error.toString()}</p>
                  }
                  else if (loading) {
                    return <p><FaSpinner />Loading..</p>
                  }
                  else {
                    const matchingItems = (data
                                       && data.cart
                                       && data.cart.items
                                       && data.cart.items.filter((x) => x.product.id ==  productId)
                                       || [])

                    if (matchingItems.length > 0) {
                      const firstMatchingItem = matchingItems[0]
                      return <>
                      <Alert variant="info">
                        <span style={{ marginRight: '10px', fontSize: '20px' }}><FaInfoCircle /></span>
                        <span>Item already in cart</span>
                      </Alert>
                      <Mutation
                        mutation={UPDATE_CART}
                        variables={{
                          cartItemId: firstMatchingItem.id,
                          qty: Number.parseInt(this.state.quanityToAdd || firstMatchingItem.qty),
                          variant: this.state.variant || firstMatchingItem.variant,
                        }}
                        update={(cache, { data }) => {
                          cache.writeQuery({
                            query: CART_QUERY,
                            variables: { orderId: data && data.updateCartItem && data.updateCartItem.id },
                            data: { cart: data && data.updateCartItem }
                          })
                        }}
                        >
                        {cartForm('Update Cart', firstMatchingItem.qty, firstMatchingItem.variant)}
                        </Mutation>
                        </>
                    } else {
                      return addToCart()
                    }
                  }
                }}
              </Query>
            }
          }}
        </Query>
      }}
      </CurrentUserContext.Consumer>
    )
  }
}

export default AddToCart

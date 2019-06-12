import React from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Collapse from 'react-bootstrap/Collapse'
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import Router from 'next/router'
import {FaSpinner} from 'react-icons/fa'
import { CurrentUserContext } from '../lib/auth'

const ADD_TO_CART = gql`
  mutation addToCart($productId: ID!, $qty: Int!, $orderId: ID) {
    addToCart(productId: $productId, qty: $qty, orderId: $orderId) {
      id
      subtotal
      items {
        id
        qty
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
mutation updateCartItem($cartItemId: ID!, $qty: Int!) {
  updateCartItem(cartItemId: $cartItemId, qty: $qty) {
    id
    subtotal
    items {
      id
      qty
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
      quanityToAdd: null
    }
    this.onChange = this.onChange.bind(this)
  }

  onChange() {
    this.setState({
      quanityToAdd: event.target.value
    })
  }

  render() {
    const productId = this.props.productId
    const maxQuantity = this.props.maxQuantity
    return (
      <CurrentUserContext.Consumer>
      { currentUser => {
        const cartForm = (changeText) => (mutationFn, { loading, error, data }) => {
          if (error) {
            return <p>Error: {error.toString()}</p>
          }
          return (
            <Form onSubmit={() => {
              event.preventDefault();
              if (loading) {
                return
              }

              if (!data) {
                mutationFn();
              } else {
                Router.push('/cart')
              }
            }}>
              {maxQuantity && <Form.Group>
                <Form.Label>Quantity in Stock</Form.Label>
                <Form.Control
                  value={maxQuantity || ''}
                  type="number"
                  disabled
                />
                </Form.Group>}
              <Collapse in={!data}>
                <Form.Group controlId="cartQuantity">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    value={this.state.quanityToAdd || ''}
                    type="number"
                    min={1}
                    max={maxQuantity || undefined}
                    onChange={this.onChange}
                  />
                </Form.Group>
              </Collapse>
              {!data && <Button variant="dark" type="submit" block disabled={loading}>
                {loading
                  && <><FaSpinner style={{ marginRight: '5px' }}/>Working...</>
                  || <>{changeText}</>
                }
              </Button>}
              {data && <Button variant="dark" type="submit" block>View Cart</Button>}
            </Form>
          )
        }
        const addToCart = () => <Mutation
          mutation={ADD_TO_CART}
          variables={{
            productId: productId,
            orderId: currentUser.getCartId(),
            qty: Number.parseInt(this.state.quanityToAdd),
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
          }}
          >
        {cartForm('Add To Cart')}
        </Mutation>

        if (!currentUser.getCartId()) {
          if (!this.state.quanityToAdd) {
            this.setState({ quanityToAdd: '1' })
          }
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
                  if (!this.state.quanityToAdd) {
                    this.setState({
                      quanityToAdd: firstMatchingItem.qty
                    })
                  }

                  return <Mutation
                    mutation={UPDATE_CART}
                    variables={{
                      cartItemId: firstMatchingItem.id,
                      qty: Number.parseInt(this.state.quanityToAdd),
                    }}
                    update={(cache, { data }) => {
                      cache.writeQuery({
                        query: CART_QUERY,
                        variables: { orderId: data && data.updateCartItem && data.updateCartItem.id },
                        data: { cart: data && data.updateCartItem }
                      })
                    }}
                    >
                    {cartForm('Update Cart')}
                    </Mutation>
                } else {
                  if (!this.state.quanityToAdd) {
                    this.setState({ quanityToAdd: '1' })
                  }
                  return addToCart()
                }
              }
            }}
          </Query>
        }
      }}
      </CurrentUserContext.Consumer>
    )
  }
}

export default AddToCart

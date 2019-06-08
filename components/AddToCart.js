import React from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Collapse from 'react-bootstrap/Collapse'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import cookies from 'nookies'
import Loader from './Loader'
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
      quanityToAdd: 1
    }
    this.onChange = this.onChange.bind(this)
  }

  onChange() {
    this.setState({
      quanityToAdd: event.target.value
    })
  }

  render() {
    const c = cookies.get()
    return (
      <CurrentUserContext.Consumer>
      { currentUser => {
        return <Mutation
          mutation={ADD_TO_CART}
          variables={{
            productId: this.props.productId,
            orderId: c.CUSTOMER_ID,
            qty: this.state.quanityToAdd
          }}
          onCompleted={(data) => {
            if (!currentUser.getCartId() && data && data.addToCart && data.addToCart.id) {
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
        {(addToCart, { loading, error, data }) => {
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
                addToCart();
              } else {
                Router.push('/cart')
              }
            }}>
              <Collapse in={!data}>
                <Form.Group controlId="cartQuantity">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    value={this.state.quanityToAdd}
                    type="number"
                    min={1}
                    onChange={this.onChange}
                  />
                </Form.Group>
              </Collapse>
              {!data && <Button variant="dark" type="submit" block disabled={loading}>
                {loading
                  && <><FaSpinner style={{ marginRight: '5px' }}/>Working...</>
                  || <>Add To Cart</>
                }
              </Button>}
              {data && <Button variant="dark" type="submit" block>View Cart</Button>}
            </Form>
          )
        }}
        </Mutation>
      }}
      </CurrentUserContext.Consumer>
    )
  }
}

export default AddToCart

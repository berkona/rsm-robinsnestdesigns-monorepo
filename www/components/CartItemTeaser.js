import React from 'react'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import { ProductLink } from './Links'
import ProductImage from './ProductImage'
import { Product, Actions } from '../lib/next-ga-ec'
import { FaSpinner } from 'react-icons/fa'

const query = gql`
  query($orderId: ID!, $shipping: Float, $zipcode: Int, $county: String) {
    cart(orderId: $orderId, shipping: $shipping, zipcode: $zipcode, county: $county) {
      id
      placed
      subtotal
      shipping
      tax
      total
      items {
        id
        price
        qty
        variant
        product {
          id
          sku
          name
          price
          salePrice
          isOnSale
          description
          category
          subcategory
          hyperlinkedImage
          image
          thumbnail
          productVariants {
            id
            text
          }
        }
      }
    }
  }
`

const saveForLater = gql`
mutation($cartItemId: ID!, $productId: ID!, $token: String!) {
  addToWishList(token: $token, productId: $productId)
  removeFromCart(cartItemId: $cartItemId) {
    id
    placed
    subtotal
    shipping
    tax
    total
    items {
      id
      price
      qty
      variant
      product {
        id
        sku
        name
        price
        salePrice
        isOnSale
        description
        category
        subcategory
        hyperlinkedImage
        image
        thumbnail
        productVariants {
          id
          text
        }
      }
    }
  }
}
`

const updateCartItem = gql`
  mutation($cartItemId: ID!, $qty: Int!, $variant: ID) {
    updateCartItem(cartItemId: $cartItemId, qty: $qty, variant: $variant) {
      id
      placed
      subtotal
      shipping
      tax
      total
      items {
        id
        price
        qty
        variant
        product {
          id
          sku
          name
          price
          salePrice
          isOnSale
          description
          category
          subcategory
          hyperlinkedImage
          image
          thumbnail
          productVariants {
            id
            text
          }
        }
      }
    }
  }
`

const deleteCartItem = gql`
  mutation($cartItemId: ID!) {
    removeFromCart(cartItemId: $cartItemId) {
      id
      placed
      subtotal
      shipping
      tax
      total
      items {
        id
        price
        qty
        variant
        product {
          id
          sku
          name
          price
          salePrice
          isOnSale
          description
          category
          subcategory
          hyperlinkedImage
          image
          thumbnail
          productVariants {
            id
            text
          }
        }
      }
    }
  }
`

const range = (min, max) => {
  if (max < min) return range(max, min)
  let arr = []
  for (let i = min; i <= max; i++) {
    arr.push(i)
  }
  return arr
}

const CartItemTeaser = (props) => (
  <>
    <Product
      sku={props.product.sku}
      name={props.product.name}
      category={props.product.category + '/' + props.product.subcategory}
      price={props.price}
      qty={props.qty}
      variant={props.variant}
      />
    <Row style={{ padding: '10px' }}>
      <Col xs={4} sm={3}>
        <ProductImage imgProps={{ style: { maxHeight: '100%', maxWidth: '100%' }}} product={props.product} />
      </Col>
      <Col xs={8} sm={9}>
        <Row>
          <Col md={6} style={{ marginBottom: '10px' }}>
          <div style={{marginBottom: '10px' }}>
            <ProductLink productId={props.product.id}
                         sku={props.product.sku}
                         category={props.product.category}
                         subcategory={props.product.subcategory}
                         title={props.product.name}
                         listName={'Cart'}>
              <p>{props.product.name}</p>
              <p>{props.product.sku}</p>
            </ProductLink>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between' }}>
            <Mutation mutation={saveForLater}
                      variables={{
                        cartItemId: props.cartItemId,
                        productId: props.product.id,
                        token: props.token
                      }}
                      update={(cache, { data }) => {
              cache.writeQuery({
                query: query,
                variables: { orderId: props.cartId },
                data: { cart: data.removeFromCart }
              })
            }}>
              {(mutationFn, { loading, error, data }) => {
                return <Button variant="outline-dark" onClick={mutationFn} disabled={!props.token || loading} style={{ marginRight: '5px'}}>
                  { loading ? <FaSpinner /> : <>Save for later</> }
                </Button>
              }}
            </Mutation>
            <Mutation mutation={deleteCartItem}
                      variables={{ cartItemId: props.cartItemId }}
                      update={(cache, { data }) => {
              cache.writeQuery({
                query: query,
                variables: { orderId: props.cartId },
                data: { cart: data.removeFromCart }
              })
              Actions.RemoveFromCart({
                sku: props.product.sku,
                name: props.product.name,
                category: props.product.category + '/' + props.product.subcategory,
                variant: props.variant,
                price: props.price,
                qty: props.qty,
                list: props.list,
                position: props.position,
              })
            }}>
              {(deleteCartItem, { data, error, loading }) => {
                if (error) return <p>Error deleting cart item: {error.toString()}</p>
                return <Form
                  style={{ marginBottom: '0' }}
                  onSubmit={() => {
                    event.preventDefault()
                    deleteCartItem()
                  }}>

                  <Button type="submit" variant="outline-dark" disabled={loading}>
                    {loading && <><FaSpinner /></> }
                    {!loading && <>Remove</>}
                  </Button>

                </Form>
              }}
            </Mutation>
          </div>
          </Col>
          <Col md={6}>
            <Row>
              <Col md={7}>
                <Mutation mutation={updateCartItem} variables={{ cartItemId: props.cartItemId, variant: props.variant }} update={(cache, { data }) => {
                  cache.writeQuery({
                    query: query,
                    variables: { orderId: props.cartId },
                    data: { cart: data.updateCartItem }
                  })
                }}>
                  {(mutationFn, { loading, error, data }) => {
                    return <Form>
                      <Form.Group controlId="cart-quantity-select">
                        <Form.Control as="select"
                                      onChange={() => mutationFn({
                                        variables: {
                                          qty: Number.parseInt(event.target.value),
                                          variant: props.variant,
                                        }
                                      })}
                                      value={props.qty}>
                          {[...range(1, props.product.qtyInStock || 25).map((qty) => <option key={qty} value={qty}>{qty}</option>)]}
                        </Form.Control>
                      </Form.Group>
                      { props.variant &&
                        <Form.Group controlId="cart-option-select">
                          <Form.Control as="select"
                                        onChange={() => mutationFn({
                                          variables: {
                                            qty: Number.parseInt(props.qty),
                                            variant: Number.parseInt(event.target.value)
                                          }
                                        })}
                                        value={props.variant}>
                            {props.product.productVariants.map(x => <option value={x.id}>{x.text}</option>)}
                          </Form.Control>
                        </Form.Group>
                      }
                    </Form>
                  }}
                </Mutation>
              </Col>
              <Col md={5}>
                <p style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'right' }}>
                  ${(props.qty * props.price).toFixed(2)}
                </p>
                { props.qty > 1 && <p style={{ color: '#888', fontSize: '12px', textAlign: 'right' }}>(${props.price.toFixed(2)} each)</p>}
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
    <hr />
  </>
)

export default CartItemTeaser

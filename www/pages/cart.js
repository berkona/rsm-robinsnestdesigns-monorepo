import React from "react"
import Link from 'next/link'
import { Query } from 'react-apollo'
import Loader from '../components/Loader'
import gql from 'graphql-tag'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import PaymentOptions from '../components/PaymentOptions'
import { PayPalButton } from "react-paypal-button-v2"
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Collapse from 'react-bootstrap/Collapse'
import { CurrentUserContext } from '../lib/auth'
import { Mutation } from 'react-apollo'
import { FaTrash, FaSpinner } from 'react-icons/fa'
import Router from 'next/router'
import fetch from 'isomorphic-unfetch'

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
        qty
        product {
          id
          sku
          name
          price
          description
        }
      }
    }
  }
`

const placeCartOrder = gql`
mutation($orderId: ID!, $paypalOrderId: ID!, $shipping: Float!, $zipcode: Int!, $county: String) {
  placeOrder(orderId: $orderId, paypalOrderId: $paypalOrderId, shipping: $shipping, zipcode: $zipcode, county: $county) {
    id
  }
}
`

const deleteCartItem = gql`
  mutation($cartItemId: ID!) {
    removeFromCart(cartItemId: $cartItemId) {
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
          description
        }
      }
    }
  }
`

const counties = "Alamance | Alexander | Alleghany | Anson | Ashe | Avery | Beaufort | Bertie | Bladen | Brunswick | Buncombe | Burke | Cabarrus | Caldwell | Camden | Carteret | Caswell | Catawba | Chatham | Cherokee | Chowan | Clay | Cleveland | Columbus | Craven | Cumberland | Currituck | Dare | Davidson | Davie | Duplin | Durham | Edgecombe | Forsyth | Franklin | Gaston | Gates | Graham | Granville | Greene | Guilford | Halifax | Harnett | Haywood | Henderson | Hertford | Hoke | Hyde | Iredell | Jackson | Johnston | Jones | Lee | Lenoir | Lincoln | McDowell | Macon | Madison | Martin | Mecklenburg | Mitchell | Montgomery | Moore | Nash | New Hanover | Northampton | Onslow | Orange | Pamlico | Pasquotank | Pender | Perquimans | Person | Pitt | Polk | Randolph | Richmond | Robeson | Rockingham | Rowan | Rutherford | Sampson | Scotland | Stanly | Stokes | Surry | Swain | Transylvania | Tyrrell | Union | Vance | Wake | Warren | Washington | Watauga | Wayne | Wilkes | Wilson | Yadkin | Yancey".split(' | ')

const taxes = {
  Durham: 7.5,
}

const isZipValid = (zip) => {
  return zip && zip.length == 5
}

const makeAmount = (value) => {
  return {
    currency_code: 'USD',
    value,
  }
}

class ProductPage extends React.Component {
  constructor(props) {
      super(props)
      this.state = {
        shippingCost: '3.99',
        taxIsValid: false,
      }
  }

  render() {
    return <CurrentUserContext.Consumer>
      {currentUser => {
        const cartId = currentUser.getCartId()
        if (!cartId) {
          return (
            <Col>
              <div id="addToCart" style={{ padding: '24px' }}>
                <h1>My Shopping Cart</h1>
                <div className="msg" align="center"> <h3>Your Shopping Cart Is Empty</h3> </div>
                <div align="center">
                  <Link href="/">
                    <button>Continue Shopping</button>
                  </Link>
                </div>
                <br></br>
                <PaymentOptions />
              </div>
            </Col>
          )
        } else {
          return (
            <Col>
            <div style={{padding: '24px'}}>
            <Query query={query} variables={{
              orderId: cartId,
              shipping: Number.parseFloat(this.state.shippingCost || '3.99'),
              zipcode: Number.parseInt(this.state.shippingZipIsValid && this.state.shippingZip),
              county: this.state.county,
            }}
            fetchPolicy="cache-and-network"
            >
              {
                ({ loading, error, data }) => {
                  if (error) return <div>Error fetching data: <span>{error.message}</span></div>
                  const cart = data.cart;
                  if (cart && cart.placed) {
                    currentUser.deleteCartId()
                    return <p>Order already placed</p>
                  }
                  if (!cart || cart.items.length == 0) {
                    return (
                      <div id="addToCart">
                        <h1>My Shopping Cart</h1>
                        <div class="msg" align="center"> <h3>Your Shopping Cart Is Empty</h3> </div>
                        <div align="center">
                          <Link href="/">
                            <button>Continue Shopping</button>
                          </Link>
                        </div>
                        <br></br>
                        <PaymentOptions />
                      </div>
                    )
                  } else {
                      let subtotal = cart.subtotal.toFixed(2)
                      let shippingCost = cart.shipping.toFixed(2)
                      let tax =  cart.tax.toFixed(2)
                      let total = cart.total.toFixed(2)

                      return (

                        <div id="addToCart">
                        <Row>
                        <Col md={8}>
                          <h1>My Shopping Cart</h1>
                          <table className="cartItems" width="100%" cellPadding="2" cellSpacing="0" style={{borderTop: "#CCCCCC solid 1px"}}>
                            <tbody>
                            <tr className="header" bgcolor="#587E98">
                <td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Item ID </div></b></font></td>
                <td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Item Name </div></b></font></td>
                <td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Quantity </div></b></font></td>
                <td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Price </div></b></font></td>
                <td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Subtotal </div></b></font></td>
                <td  bgcolor="#587E98"></td>
                <td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Delete </div></b></font></td>
              </tr>

                              {cart.items.map(({ id, product, qty }, idx) => {
                                return <tr key={idx} className="odd" bgcolor="#E4EDF4">
                                  <td style={{borderTop: "#CCCCCC solid 1px"}}>
                                    <div align="center">
                                      <Link href={`/product?productId=${product.id}`} as={`/product/${product.id}`}>
                                        <a>{product.sku}</a>
                                      </Link>
                                    </div>
                                  </td>
                                  <td style={{borderTop: "#CCCCCC solid 1px"}}>
                                    <div align="left">
                                      <font size="-1">{product.name}</font>
                                    </div>
                                  </td>
                                  <td style={{borderTop: "#CCCCCC solid 1px"}}>
                                    <div align="center">
                                      <input type="text" name="Quantity" value={qty} size="3" maxLength="6" />
                                    </div>
                                  </td>
                                  <td style={{borderTop: "#CCCCCC solid 1px"}}><div align="right">${product.price.toFixed(2)}</div></td>
                                  <td style={{borderTop: "#CCCCCC solid 1px"}}><div align="right">${product.price.toFixed(2)}</div></td>
                                  <td style={{borderTop: "#CCCCCC solid 1px"}}></td>
                                  <td style={{borderTop: "#CCCCCC solid 1px"}}>
                                    <div align="center">
                                      <Mutation mutation={deleteCartItem} update={(cache, { data }) => {
                                        cache.writeQuery({
                                          query: query,
                                          variables: { orderId: cartId },
                                          data: { cart: data.removeFromCart }
                                        })
                                      }}>
                                        {(deleteCartItem, { data, error, loading }) => {
                                          if (error) return <p>Error deleting cart item: {error.toString()}</p>
                                          return <Form
                                            style={{ marginBottom: '0' }}
                                            onSubmit={() => {
                                              event.preventDefault()
                                              deleteCartItem({ variables: { cartItemId: id } })
                                            }}>

                                            <Button type="submit" variant="danger" disabled={loading}>
                                              {loading && <><FaSpinner style={{ marginRight: '5px' }} /> Working...</> }
                                              {!loading && <><FaTrash /> Remove</>}
                                            </Button>

                                          </Form>
                                        }}
                                      </Mutation>
                                    </div>
                                  </td>
                                </tr>
                              })}
              	 <tr>
                      <td colSpan="4" align="right" style={{borderTop: "#CCCCCC solid 1px"}}><strong>Subtotal:</strong></td>
                      <td style={{borderTop: "#CCCCCC solid 1px"}} align="right"><strong>${subtotal}</strong></td>
                        <td style={{borderTop: "#CCCCCC solid 1px"}} align="center"></td>
                        <td style={{borderTop: "#CCCCCC solid 1px"}} align="center"></td>
                  </tr>
                  <tr>
                     <td colSpan="4" align="right" style={{borderTop: "#CCCCCC solid 1px"}}><strong>Shipping:</strong></td>
                     <td style={{borderTop: "#CCCCCC solid 1px"}} align="right"><strong>${shippingCost}</strong></td>
                       <td style={{borderTop: "#CCCCCC solid 1px"}} align="center"></td>
                       <td style={{borderTop: "#CCCCCC solid 1px"}} align="center"></td>
                   </tr>
                   <tr>
                      <td colSpan="4" align="right" style={{borderTop: "#CCCCCC solid 1px"}}><strong>Tax:</strong></td>
                      <td style={{borderTop: "#CCCCCC solid 1px"}} align="right"><strong>${tax}</strong></td>
                        <td style={{borderTop: "#CCCCCC solid 1px"}} align="center"></td>
                        <td style={{borderTop: "#CCCCCC solid 1px"}} align="center"></td>
                    </tr>
                    <tr>
                       <td colSpan="4" align="right" style={{borderTop: "#CCCCCC solid 1px"}}><strong>Total:</strong></td>
                       <td style={{borderTop: "#CCCCCC solid 1px"}} align="right"><strong>${total}</strong></td>
                         <td style={{borderTop: "#CCCCCC solid 1px"}} align="center"></td>
                         <td style={{borderTop: "#CCCCCC solid 1px"}} align="center"></td>
                     </tr>
                  </tbody></table>
                  </Col>
                  <Col md={4}>
                          <div align="left" style={{ padding: '16px' }}>
                            <h1>Checkout</h1>
                            <div align="left">
                            <Form onSubmit={() => { event.preventDefault() }}>
                              <Form.Group controlId="shippingZip">
                                <Form.Label>Enter your zipcode</Form.Label>
                                <Form.Control type="number" value={this.state.shippingZip} onChange={() => this.setState({ shippingZip: event.target.value, shippingZipIsValid: isZipValid(event.target.value) })}/>
                              </Form.Group>
                              <Collapse in={this.state.shippingZipIsValid && (this.state.shippingZip.startsWith('27') || this.state.shippingZip.startsWith('28'))}>
                                <Form.Group controlId="shippingZipCounty">
                                  <Form.Label>
                                    Enter the county you reside in
                                  </Form.Label>
                                  <Form.Control as="select" onChange={() => this.setState({ taxIsValid: true, tax: taxes[event.target.value] || 0, county: event.target.value })}>
                                    {[...counties.map((c) => <option selected={this.state.county == c}>{c}</option>)]}
                                  </Form.Control>
                                </Form.Group>
                              </Collapse>
                              <Form.Group>
                                <fieldset>
                                  {subtotal < 75 ? <>
                                    <Form.Check
                                    type="radio"
                                    name="shippingMethod"
                                    label="First Class Mail: $3.99"
                                    checked={this.state.shippingCost == '3.99'}
                                    onClick={() => this.setState({ shippingCost: '3.99'})}
                                  />
                                  <Form.Check
                                    type="radio"
                                    name="shippingMethod"
                                    label="Priority Mail: $7.99"
                                    checked={this.state.shippingCost == '7.99'}
                                    onClick={() => this.setState({ shippingCost: '7.99' })}
                                  />
                                  <Form.Check
                                      type="radio"
                                      name="shippingMethod"
                                      label="Free Shipping Over $75"
                                      checked={false}
                                      disabled={true}
                                      />
                                  </>
                                  : <>
                                  <Form.Check
                                  type="radio"
                                  name="shippingMethod"
                                  label="First Class Mail: $3.99"
                                  checked={false}
                                  disabled={true}
                                />
                                <Form.Check
                                  type="radio"
                                  name="shippingMethod"
                                  label="Priority Mail: $7.99"
                                  checked={false}
                                  disabled={true}
                                />
                                  <Form.Check
                                      type="radio"
                                      name="shippingMethod"
                                      label="Free Shipping Over $75"
                                      checked={true}
                                      disabled={true}
                                      /></>
                                    }

                                </fieldset>
                              </Form.Group>
                              <Form.Group>
                              <p>By placing an order you agree to the <Link href="/ShippingInfo/shipping">
                              <a target="_blank">
                              shipping terms/order processing</a>
                              </Link> and
                              <Link href="/Policies/Policies">
                                <a style={{ paddingLeft: '5px' }} target="_blank">
                                policies
                                </a>
                                </Link>
                                </p>
                                <Form.Check
                                  name="shippingMethod"
                                  label="I agree"
                                  checked={this.state.agreeToPolicies}
                                  onClick={() => this.setState({ agreeToPolicies: event.target.checked})}
                                >
                                </Form.Check>
                              </Form.Group>
                            </Form>
                            {this.state.shippingZipIsValid && this.state.agreeToPolicies &&
                              <Mutation mutation={placeCartOrder} variables={{ orderId: cartId, shipping: Number.parseFloat(this.state.shippingCost), zipcode: Number.parseInt(this.state.shippingZip), county: this.state.county }}>
                                {(mutationFn, { loading, error, data }) =>
                                  error
                                  ? <p>Network error: {error.toString()}</p>
                                  : !data
                                    ? <PayPalButton
                                       options={{ clientId: 'AfRXnOb4Weq93kfQLyPKfaW3e8bYvRbkDBoeTZwCPLcxdottjyLo5t00XxZteN6Up6bmYIKn-GRSUMg2' }}
                                       amount={total}
                                       createOrder={(data, actions) => {
                                         return actions.order.create({
                                           purchase_units: [{
                                             amount: {
                                               currency: 'USD',
                                               value: total,
                                               breakdown: {
                                                 item_total: makeAmount(subtotal),
                                                 shipping: makeAmount(shippingCost),
                                                 tax_total: makeAmount(tax),
                                               }
                                             },
                                             description: 'Your order with Robin\'s Nest Designs',
                                             invoice_id: cartId,
                                             soft_descriptor: 'RobinsNestDesigns',
                                             items: cart.items.map(({ product, qty }) => {
                                               return {
                                                 sku: product.sku,
                                                 name: product.name,
                                                 unit_amount: makeAmount(product.price),
                                                 quantity: qty,
                                                 description: product.description && product.description.slice(127) || '',
                                                 category: 'PHYSICAL_GOODS',
                                               }
                                             })
                                           }]
                                         })
                                       }}
                                       onSuccess={(details, data) => {
                                         console.log('Paypal payment received', details, data)
                                         const paypalOrderId = data && data.orderID;
                                         if (!paypalOrderId) {
                                           console.log('invalid paypal order id')
                                           return Promise.reject(new Error('invalid order id returned'))
                                         } else {
                                           return mutationFn({ variables: { paypalOrderId }}).then(
                                             () => {
                                               currentUser.deleteCartId()
                                               Router.push('/order/' + cartId)
                                             },
                                             (err) => console.log('backend place order error', err)
                                           )
                                         }
                                       }}
                                       />
                                    : <p>Order placed</p>
                                  }
                              </Mutation>
                            }
                          </div>
                          </div>
                          </Col>
                          </Row>
                        </div>

                      )
                    }
                  }
                }
              </Query>
              </div>
              </Col>
            )
        }
      }}
    </CurrentUserContext.Consumer>
  }
}

export default ProductPage
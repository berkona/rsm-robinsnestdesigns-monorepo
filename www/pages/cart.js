import React from "react"
import Link from 'next/link'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import PaymentOptions from '../components/PaymentOptions'
import { PayPalButton } from "react-paypal-button-v2"
import Form from 'react-bootstrap/Form'
import Collapse from 'react-bootstrap/Collapse'
import { CurrentUserContext } from '../lib/auth'
import { Mutation } from 'react-apollo'
import Router from 'next/router'
import fetch from 'isomorphic-unfetch'
import { checkoutOpenPaypalEvent, checkoutDoneEvent } from '../lib/react-ga'
import { Product, CheckoutAction } from '../lib/next-ga-ec'
import SEO from '../components/SEO'
import CartItemTeaser from '../components/CartItemTeaser'

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

const placeCartOrder = gql`
mutation($orderId: ID!, $paypalOrderId: ID!, $shipping: Float!, $zipcode: Int!, $county: String) {
  placeOrder(orderId: $orderId, paypalOrderId: $paypalOrderId, shipping: $shipping, zipcode: $zipcode, county: $county) {
    id
  }
}
`

const CURRENT_USER = gql`
query($token: String!) {
  user(token: $token) {
    id
    firstName
    lastName
    address
    city
    state
    zip
    country
    phone
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

const needsTax = (zip) => isZipValid(zip) && (zip.startsWith('27') || zip.startsWith('28'))

class CartPage extends React.Component {
  constructor(props) {
      super(props)
      this.state = {
        shippingCost: '3.99',
        taxIsValid: false,
        needsPageView: true,
      }
  }

  render() {
    return <CurrentUserContext.Consumer>
      {currentUser => {
        const cartId = currentUser.getCartId()
        if (!cartId) {
          return (
            <Col>
              <SEO title="My Cart" description="View the items in your cart at Robin's Nest Designs" />
              <div id="addToCart" style={{ padding: '24px' }}>
                <h1>My Shopping Cart</h1>
                <hr />
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
              zipcode: Number.parseInt(isZipValid(this.state.shippingZip) && this.state.shippingZip),
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
                        <hr />
                        <div className="msg" align="center"> <h3>Your Shopping Cart Is Empty</h3> </div>
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
                          <hr />
                          {
                            cart.items.map(({
                              id,
                              price,
                              qty,
                              product,
                              variant
                            }) => <CartItemTeaser key={id}
                                                  token={currentUser.getToken()}
                                                  cartId={cartId}
                                                  cartItemId={id}
                                                  product={product}
                                                  price={price}
                                                  qty={qty}
                                                  variant={variant} />)
                          }
                        </Col>
                        <Col md={4}>
                          <div align="left" style={{ padding: '0px 16px' }}>
                            <h1>Checkout</h1>
                            <hr />
                            <CheckoutAction step={1}/>

                            <table style={{ fontSize: '16px', fontWeight: 'bold', width: '100%', marginBottom: '16px' }}>
                              <tbody>
                                <tr>
                                  <td>Subtotal</td>
                                  <td style={{ textAlign: 'right' }}>${subtotal}</td>
                                </tr>
                                <tr>
                                  <td>Shipping</td>
                                  <td style={{ textAlign: 'right' }}>${shippingCost}</td>
                                </tr>
                                <tr>
                                  <td>Tax</td>
                                  <td style={{ textAlign: 'right' }}>${tax}</td>
                                </tr>
                                <tr>
                                  <td>Grand Total</td>
                                  <td style={{ textAlign: 'right' }}>${total}</td>
                                </tr>
                              </tbody>
                            </table>

                            <div align="left">
                            <Query query={CURRENT_USER} variables={{ token: currentUser.getToken() }}  fetchPolicy={"cache-and-network"} onCompleted={(data) => { this.setState({ shippingZip: data.user.zip }) }}>
                              {({ loading, error, data }) => {
                                return <>
                                  <Form onSubmit={() => { event.preventDefault() }}>
                                    <Form.Group controlId="shippingZip">
                                      <Form.Label>Enter your zipcode</Form.Label>
                                      <Form.Control type="number" value={this.state.shippingZip} onChange={() => this.setState({ shippingZip: event.target.value, shippingZipIsValid: isZipValid(event.target.value) })}/>
                                    </Form.Group>
                                    <Collapse in={needsTax(this.state.shippingZip)}>
                                      <Form.Group controlId="shippingZipCounty">
                                        <Form.Label>
                                          Enter the county you reside in
                                        </Form.Label>
                                        <Form.Control as="select" onChange={() => this.setState({ taxIsValid: true, tax: taxes[event.target.value] || 0, county: event.target.value })} value={this.state.county}>
                                          { !this.state.county && <option key="null"></option> }
                                          {[...counties.map((c) => <option key={c} value={c}>{c}</option>)]}
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
                                  {isZipValid(this.state.shippingZip) && this.state.agreeToPolicies && ( !needsTax(this.state.shippingZip) || this.state.taxIsValid ) &&
                                    <Mutation mutation={placeCartOrder} variables={{ orderId: cartId, shipping: Number.parseFloat(this.state.shippingCost), zipcode: Number.parseInt(this.state.shippingZip), county: this.state.county }}>
                                      {(mutationFn, { loading, error, data }) =>
                                        error
                                        ? <p>Network error: {error.toString()}</p>
                                        : !data
                                          ? <PayPalButton
                                             options={{ clientId: 'AfRXnOb4Weq93kfQLyPKfaW3e8bYvRbkDBoeTZwCPLcxdottjyLo5t00XxZteN6Up6bmYIKn-GRSUMg2' }}
                                             amount={total}
                                             createOrder={(data, actions) => {
                                               checkoutOpenPaypalEvent(cart.items)
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
                                                   items: cart.items.map(({ product, qty, price }) => {
                                                     return {
                                                       sku: product.sku,
                                                       name: product.name,
                                                       unit_amount: makeAmount(price),
                                                       quantity: qty,
                                                       description: product.description && product.description.slice(0, 127) || '',
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
                                                     // TODO: add coupon
                                                     checkoutDoneEvent(cart.items, paypalOrderId,
                                                       details.purchase_units[0].amount.value,
                                                       details.purchase_units[0].amount.breakdown.tax_total.value,
                                                       details.purchase_units[0].amount.breakdown.shipping.value
                                                     )
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
                                </>
                              }}
                            </Query>
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

export default CartPage

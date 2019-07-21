import React from 'react'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Form from 'react-bootstrap/Form'
import gql from 'graphql-tag'
import Collapse from 'react-bootstrap/Collapse'
import { Query, Mutation } from 'react-apollo'
import { CheckoutAction } from '../lib/next-ga-ec'
import { CurrentUserContext } from '../lib/auth'
import { ORDER_GET } from '../constants/queries'
import Loader from '../components/Loader'
import ApolloError from '../components/ApolloError'
import SEO from '../components/SEO'
import { Product } from '../lib/next-ga-ec'
import Link from 'next/link'
import { PayPalButton } from "react-paypal-button-v2"
import { checkoutOpenPaypalEvent, checkoutDoneEvent } from '../lib/react-ga'
import Router from 'next/router'
import Button from 'react-bootstrap/Button'
import InlineQuery from '../components/InlineQuery'

const placeCartOrder = gql`
mutation($orderId: ID!, $paypalOrderId: ID!, $shipping: Float!, $county: String, $promo: String) {
  placeOrder(orderId: $orderId, paypalOrderId: $paypalOrderId, shipping: $shipping, county: $county, promo: $promo) {
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

const GET_PAYPAL_CLIENT_ID = gql`
query {
  siteinfo {
    paypalClientId
  }
}
`

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

const counties = "Alamance | Alexander | Alleghany | Anson | Ashe | Avery | Beaufort | Bertie | Bladen | Brunswick | Buncombe | Burke | Cabarrus | Caldwell | Camden | Carteret | Caswell | Catawba | Chatham | Cherokee | Chowan | Clay | Cleveland | Columbus | Craven | Cumberland | Currituck | Dare | Davidson | Davie | Duplin | Durham | Edgecombe | Forsyth | Franklin | Gaston | Gates | Graham | Granville | Greene | Guilford | Halifax | Harnett | Haywood | Henderson | Hertford | Hoke | Hyde | Iredell | Jackson | Johnston | Jones | Lee | Lenoir | Lincoln | McDowell | Macon | Madison | Martin | Mecklenburg | Mitchell | Montgomery | Moore | Nash | New Hanover | Northampton | Onslow | Orange | Pamlico | Pasquotank | Pender | Perquimans | Person | Pitt | Polk | Randolph | Richmond | Robeson | Rockingham | Rowan | Rutherford | Sampson | Scotland | Stanly | Stokes | Surry | Swain | Transylvania | Tyrrell | Union | Vance | Wake | Warren | Washington | Watauga | Wayne | Wilkes | Wilson | Yadkin | Yancey".split(' | ')

class CheckoutPage extends React.Component {

  constructor(props) {
      super(props)
      this.state = {
        shippingCost: '3.99',
        taxIsValid: false,
        needsPageView: true,
        promo: null,
        newPromo: '',
      }
  }

  render() {
    return <Col>
      <div style={{padding: '24px'}}>
      <SEO title="Checkout" description="Pay for your order at Robin's Nest Designs" />
      <CurrentUserContext.Consumer>
        {currentUser => {
          if (!currentUser.getCartId()) {
            return <p>No shopping cart</p>
          } else {
            return <Query
            query={ORDER_GET}
            fetchPolicy="cache-and-network"
            variables={{
              orderId: currentUser.getCartId(),
              shipping: Number.parseFloat(this.state.shippingCost || '3.99'),
              county: this.state.county,
              promo: this.state.promo,
            }}>
            {({ loading, error, data }) => {
                if (error) return <ApolloError error={error} />
                if (!data || !data.cart) return <Loader />

                const cartData = data
                return <>
                {cartData.cart.items.map(cartItem => <Product
                    key={cartItem.id}
                    sku={cartItem.product.sku}
                    name={cartItem.product.name}
                    category={cartItem.product.category + '/' + cartItem.product.subcategory}
                    price={cartItem.price}
                    qty={cartItem.qty}
                    variant={cartItem.variant}
                  />
                )}
                <CheckoutAction step={1} />
                <Row>
                  <Col md={8}>
                  <h1>Checkout</h1>
                  <hr />
                  <Query query={CURRENT_USER} variables={{ token: currentUser.getToken() }}  fetchPolicy={"cache-and-network"}>
                    {({ loading, error, data }) => {
                      const {
                        subtotal
                      } = cartData.cart
                      return <>
                        <Form onSubmit={() => { event.preventDefault() }}>
                          <Form.Group controlId="ncResident">
                            <Form.Label>Are you an NC resident for tax purposes?</Form.Label>
                            <fieldset>
                              <Form.Check
                                type="radio"
                                name="ncResident_Yes"
                                label="Yes"
                                checked={this.state.shippingZip == '27712' }
                                onChange={() => this.setState({ shippingZip: '27712' })}
                              />
                              <Form.Check
                                type="radio"
                                name="ncResident_No"
                                label="No"
                                checked={this.state.shippingZip == '00000' }
                                onChange={() => this.setState({ shippingZip: '00000' })}
                              />
                            </fieldset>
                          </Form.Group>
                          <Collapse in={needsTax(this.state.shippingZip)}>
                            <Form.Group controlId="shippingZipCounty">
                              <Form.Label>
                                Enter the county you reside in
                              </Form.Label>
                              <Form.Control as="select" onChange={() => this.setState({ taxIsValid: true, county: event.target.value })} value={this.state.county}>
                                { !this.state.county && <option key="null"></option> }
                                {[...counties.map((c) => <option key={c} value={c}>{c}</option>)]}
                              </Form.Control>
                            </Form.Group>
                          </Collapse>
                          <Form.Group>
                            <Form.Label>
                              Choose your shipping method
                            </Form.Label>
                            <fieldset>
                              {subtotal < 75 ? <>
                                <Form.Check
                                type="radio"
                                name="shippingMethod"
                                label="First Class Mail: $3.99"
                                checked={this.state.shippingCost == '3.99'}
                                onChange={() => this.setState({ shippingCost: '3.99'})}
                              />
                              <Form.Check
                                type="radio"
                                name="shippingMethod"
                                label="Priority Mail: $7.99"
                                checked={this.state.shippingCost == '7.99'}
                                onChange={() => this.setState({ shippingCost: '7.99' })}
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
                              checked={this.state.agreeToPolicies || false}
                              onChange={() => this.setState({ agreeToPolicies: event.target.checked})}
                            >
                            </Form.Check>
                          </Form.Group>
                        </Form>
                        </>
                    }}
                  </Query>
                  </Col>
                  <Col md={4}>
                    <div align="left" style={{ padding: '0px 16px' }}>
                      <h1>Total</h1>
                      <hr />

                      <table style={{ fontSize: '16px', fontWeight: 'bold', width: '100%', marginBottom: '16px' }}>
                        <tbody>
                          <tr>
                            <td>Subtotal</td>
                            <td style={{ textAlign: 'right' }}>${cartData.cart.subtotal.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td>Shipping</td>
                            <td style={{ textAlign: 'right' }}>${cartData.cart.shipping.toFixed(2)}</td>
                          </tr>
                          {
                          cartData.cart.discount > 0 && <tr>
                            <td>Discount</td>
                            <td style={{ textAlign: 'right' }}>(${cartData.cart.discount.toFixed(2)})</td>
                          </tr>
                          }
                          <tr>
                            <td>Tax</td>
                            <td style={{ textAlign: 'right' }}>${cartData.cart.tax.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td>Grand Total</td>
                            <td style={{ textAlign: 'right' }}>${cartData.cart.total.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>

                      <hr />

                      <Form noValidate
                            onSubmit={(e) => { e.preventDefault(); this.setState({ promoSubmitted: true, promo: this.state.newPromo }) }}>
                        <Row>
                        <Col md={8}>
                          <Form.Group controlId="checkoutPromo">
                            <Form.Label>Promo</Form.Label>
                            <Form.Control
                              value={this.state.newPromo}
                              onChange={() => this.setState({ newPromo: event.target.value })}
                              isInvalid={this.state.promoSubmitted && cartData.cart.discount < 0.01 }
                              isValid={this.state.promoSubmitted && cartData.cart.discount > 0}
                            />
                            <Form.Control.Feedback type={"invalid"}>
                              This promo code is not valid
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Button type="submit" style={{ marginTop: '25.5px' }}>Apply</Button>
                        </Col>
                        </Row>
                      </Form>

                      <hr />

                      {
                        isZipValid(this.state.shippingZip)
                        && this.state.agreeToPolicies
                        && ( !needsTax(this.state.shippingZip)
                            || this.state.taxIsValid )
                        &&
                        <Mutation mutation={placeCartOrder} variables={{ orderId: currentUser.getCartId(), shipping: Number.parseFloat(this.state.shippingCost), county: this.state.county, promo: this.state.promo }}>
                          {(mutationFn, { loading, error, data }) =>
                            loading
                            ? <p>Please wait...</p>
                            : error
                            ? <p>Network error: {error.toString()}</p>
                            : !data
                              ? <InlineQuery query={GET_PAYPAL_CLIENT_ID}>
                                  {({ siteinfo: { paypalClientId } }) => <PayPalButton
                                   options={{ clientId: paypalClientId }}
                                   amount={cartData.cart.total}
                                   createOrder={(data, actions) => {
                                     checkoutOpenPaypalEvent(cartData.cart.items)
                                     return actions.order.create({
                                       purchase_units: [{
                                         amount: {
                                           currency: 'USD',
                                           value: cartData.cart.total,
                                           breakdown: {
                                             item_total: makeAmount(cartData.cart.subtotal),
                                             shipping: makeAmount(cartData.cart.shipping),
                                             tax_total: makeAmount(cartData.cart.tax),
                                             discount: makeAmount(cartData.cart.discount),
                                           }
                                         },
                                         description: 'Your order with Robin\'s Nest Designs',
                                         invoice_id: currentUser.getCartId(),
                                         soft_descriptor: 'RobinsNestDesigns',
                                         items: cartData.cart.items.map(({ product, qty, price }) => {
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
                                           currentUser.deleteCartId()
                                           Router.push('/order/' + currentUser.getCartId())
                                           // TODO: add coupon
                                           checkoutDoneEvent(cartData.cart.items, paypalOrderId,
                                             details.purchase_units[0].amount.value,
                                             details.purchase_units[0].amount.breakdown.tax_total.value,
                                             details.purchase_units[0].amount.breakdown.shipping.value
                                           )
                                         },
                                         (err) => console.log('backend place order error', err)
                                       )
                                     }
                                   }}
                                   catchError={(err) => {
                                     console.error("paypal txn error", err)
                                     this.setState({ paypalError: err.toString() })
                                   }}
                                   />}
                                 </InlineQuery>
                              : <p>Order placed</p>
                            }
                        </Mutation>
                        || <p>Fill out form to continue checkout</p>
                      }
                      { this.state.paypalError && <p>Could not place order: {this.state.paypalError}</p>}
                    </div>
                  </Col>
                </Row>
                </>
              }}
            </Query>
          }
        }}
      </CurrentUserContext.Consumer>
      </div>
    </Col>
  }
}

export default CheckoutPage

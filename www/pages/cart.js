import React from "react"
import Link from 'next/link'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import PaymentOptions from '../components/PaymentOptions'
import Form from 'react-bootstrap/Form'
import { CurrentUserContext } from '../lib/auth'
import Router from 'next/router'
import fetch from 'isomorphic-unfetch'
import SEO from '../components/SEO'
import CartItemTeaser from '../components/CartItemTeaser'
import { ORDER_GET } from '../constants/queries'
import Button from 'react-bootstrap/Button'
import Wishlist from '../components/Wishlist'
import ContentWithSidebar from '../components/ContentWithSidebar'


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

const EmptyShoppingCart = props => (
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
)

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
    return <>
      <SEO title="My Cart" description="View the items in your cart at Robin's Nest Designs" />
    <CurrentUserContext.Consumer>
      {currentUser => {
        const cartId = currentUser.getCartId()
        if (!cartId) {
          return <ContentWithSidebar><EmptyShoppingCart /></ContentWithSidebar>
        } else {
          return (
            <ContentWithSidebar>
            <div style={{padding: '24px'}}>
            <Query query={ORDER_GET} variables={{
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
                    return <EmptyShoppingCart />
                  } else {
                      let subtotal = cart.subtotal.toFixed(2)

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

                            <table style={{ fontSize: '16px', fontWeight: 'bold', width: '100%', marginBottom: '16px' }}>
                              <tbody>
                                <tr>
                                  <td>Subtotal</td>
                                  <td style={{ textAlign: 'right' }}>${subtotal}</td>
                                </tr>
                              </tbody>
                            </table>

                            <Link href="/checkout">
                              <Button variant="primary" block>
                              Checkout
                              </Button>
                            </Link>
                          </div>
                          </Col>
                          </Row>
                          {currentUser.isLoggedIn() && <Row>
                            <Col>
                              <h2>My Wish List</h2>
                              <hr />
                              <Wishlist />
                            </Col>
                          </Row>
                          }
                        </div>
                      )
                    }
                  }
                }
              </Query>
              </div>
              </ContentWithSidebar>
            )
        }
      }}
    </CurrentUserContext.Consumer>
    </>
  }
}

export default CartPage

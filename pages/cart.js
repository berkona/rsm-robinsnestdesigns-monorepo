import React from "react"
import Link from 'next/link'
import { Query } from 'react-apollo'
import Loader from '../components/Loader'
import gql from 'graphql-tag'

import PaymentOptions from '../components/PaymentOptions'
import { ProductLink } from '../components/Links'

const query = gql`
  query {
    cartItems @client {
      product {
        id
        sku
        name
        price
      }
      qty
    }
  }
`

const ProductPage = (props) => (
  <Query query={query}>
    {
      ({ loading, error, data }) => {
        if (loading) return <Loader />
        if (error) return <div>Error fetching data: {error}</div>
        if (!data.cartItems || data.cartItems.length == 0) {
          return (
            <div id="addToCart">
              <h1>My Shopping Cart</h1>
              <div class="msg" align="center"> <h3>Your Shopping Cart Is Empty</h3> </div>
              <div align="center">
                <Link href="/search">
                  <button>Continue Shopping</button>
                </Link>
              </div>
              <br></br>
              <PaymentOptions />
            </div>
          )
        } else {
          const subtotal = data.cartItems.reduce((total, next) => total + next.product.price * next.qty).toFixed(2)

          return (
            <div id="addToCart">
              <h1>My Shopping Cart</h1>
              <table class="cartItems" width="100%" cellPadding="2" cellSpacing="0" style="border:#CCCCCC solid 1px;">
                <tbody>
                <tr class="header" bgcolor="#587E98">
    <td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Item ID </div></b></font></td>
    <td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Item Name </div></b></font></td>
    <td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Quantity </div></b></font></td>
    <td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Price </div></b></font></td>
    <td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Subtotal </div></b></font></td>
    <td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Delete </div></b></font></td>
  </tr>

                  {data.map(({product, qty}) => {
                    return <tr key={product.id} class="odd" bgcolor="#E4EDF4">
                      <td style="border-top:#CCCCCC solid 1px;">
                        <div align="center">
                          <Link href={`/product?productId=${product.id}`} as={`/product/${product.id}`}>
                            <a>{product.sku}</a>
                          </Link>
                        </div>
                      </td>
                      <td style="border-top:#CCCCCC solid 1px;">
                        <div align="center">
                          <font size="-1">{product.name}</font>
                        </div>
                      </td>
                      <td style="border-top:#CCCCCC solid 1px;">
                        <div align="center">
                          <input type="text" name="Quantity" value={qty} size="3" maxLength="6" />
                        </div>
                      </td>
                      <td style="border-top:#CCCCCC solid 1px;"><div align="center">${product.price}</div></td>
                      <td style="border-top:#CCCCCC solid 1px;"><div align="center">${product.price}</div></td>
                      <td style="border-top:#CCCCCC solid 1px;">
                        <div align="center">
                          <form action="delete.cfm" method="post" style="margin-bottom: 0">

                              <input type="hidden" name="History" value="test" />
                              <input type="hidden" name="KeyWords" value="test" />

                            <input type="hidden" name="ID" value="200115" />
                            <input type="hidden" name="ItemID" value="SCBB012" />
                            <input type="Hidden" name="ProductID" value="8711" />

                                <input type="submit" value="Delete" />

                          </form>
                        </div>
                      </td>
                    </tr>
                  })}
  	<tr>
          <td colspan="6" align="right" style="border-top:#CCCCCC solid 1px;"><strong>Running Subtotal:</strong></td>
          <td style="border-top:#CCCCCC solid 1px;"><strong>${subtotal}</strong></td>
      </tr></tbody></table>

              <div align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="border:#CCCCCC solid 1px; background-color: #587E98">
                    <tbody><tr class="header" bgcolor="#587E98">

                      // <form action="https://www.robinsnestdesigns.com/secure/customer_account.cfm" method="post" onsubmit="return checkCheckBox(this)"></form>
                        <td align="right"><input type="hidden" name="CustomerID" value="29821189" />
                        <input type="checkbox" value="0" name="agree" /> <font color="#FFFFFF">I agree to the <a href="http://www.robinsnestdesigns.com/ShippingInfo/shipping.cfm" style="color:#FFFFCC; text-decoration: underline;">shipping terms/order processing</a> and <a href="http://www.robinsnestdesigns.com/Policies/Policies.cfm" style="color:#FFFFCC; text-decoration: underline;">policies</a></font>
                        <input type="submit" value="I Am Ready To Checkout Now" align="right" />
                        </td>

                    </tr>
                </tbody></table>
              </div>
              <br></br>
              <PaymentOptions />
            </div>
          )
        }
      }
    }
  </Query>
)

export default ProductPage

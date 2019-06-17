import React from "react"
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Table from 'react-bootstrap/Table'
import { withRouter } from 'next/router'
import Loader from '../components/Loader'
import Link from 'next/link'

const query = gql`
  query($orderId: ID!) {
    cart(orderId: $orderId) {
      id
      placed
      customerInfo {
        FirstName
        LastName
        Address
        City
        State
        Zip
        BFirstName
        BLastName
        BAddress
        BCity
        BState
        BZip
      }
      subtotal
      tax
      shipping
      total
      items {
        id
        qty
        price
        product {
          id
          sku
          name
        }
      }
    }
  }
`

const OrderPage = withRouter(
  (props) => <Col><div style={{ paddingLeft: '10px', paddingRight: '10px' }}><Query query={query} variables={{ orderId: props.router.query.orderId }}>
  {({ loading, error, data}) => {
    if (loading) return <Loader />
    if (error) return <p>Error: {error.toString()}</p>
    if (!data.cart.placed) {
      return <p>Order not yet placed.  If you think this is an error contact Support.</p>
    }
    return <>
      <Row><Col><h1>Your order with Robin's Nest Designs</h1><p style={{ marginBottom: '16px' }}>Thank you for ordering with Robin's Nest Designs.</p><hr /></Col></Row>
      <Row>
        <Col md={6}>
          <p>Order No: {props.router.query.orderId}</p>
          <p></p>
          <p>Ship To</p>
          <p></p>
          <p>{data.cart.customerInfo.FirstName} {data.cart.customerInfo.LastName}</p>
          <p>{data.cart.customerInfo.Address}</p>
          <p>{data.cart.customerInfo.City}, {data.cart.customerInfo.State} {data.cart.customerInfo.Zip}</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <h1>Items in Order</h1>
          <Table className="cartItems" width="100%" cellPadding="2" cellSpacing="0" style={{borderTop: "#CCCCCC solid 1px"}}>
            <tbody>
            <tr className="header" bgcolor="#587E98">
<td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Item ID </div></b></font></td>
<td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Item Name </div></b></font></td>
<td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Quantity </div></b></font></td>
<td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Price </div></b></font></td>
<td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Subtotal </div></b></font></td>
</tr>

              {data.cart.items.map(({ id, product, qty, price }) => {
                return <tr key={id} className="odd" bgcolor="#E4EDF4">
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
                      <font size="-1">{qty}</font>
                    </div>
                  </td>
                  <td style={{borderTop: "#CCCCCC solid 1px"}}><div align="right">${price.toFixed(2)}</div></td>
                  <td style={{borderTop: "#CCCCCC solid 1px"}}><div align="right">${(qty * price).toFixed(2)}</div></td>
                </tr>
              })}
 <tr>
      <td colSpan="4" align="right" style={{borderTop: "#CCCCCC solid 1px"}}><strong>Subtotal:</strong></td>
      <td style={{borderTop: "#CCCCCC solid 1px"}} align="right"><strong>${data.cart.subtotal.toFixed(2)}</strong></td>
  </tr>
  <tr>
     <td colSpan="4" align="right" style={{borderTop: "#CCCCCC solid 1px"}}><strong>Shipping:</strong></td>
     <td style={{borderTop: "#CCCCCC solid 1px"}} align="right"><strong>${data.cart.shipping.toFixed(2)}</strong></td>
   </tr>
   <tr>
      <td colSpan="4" align="right" style={{borderTop: "#CCCCCC solid 1px"}}><strong>Tax:</strong></td>
      <td style={{borderTop: "#CCCCCC solid 1px"}} align="right"><strong>${data.cart.tax.toFixed(2)}</strong></td>
    </tr>
    <tr>
       <td colSpan="4" align="right" style={{borderTop: "#CCCCCC solid 1px"}}><strong>Total:</strong></td>
       <td style={{borderTop: "#CCCCCC solid 1px"}} align="right"><strong>${data.cart.total.toFixed(2)}</strong></td>
     </tr>
  </tbody></Table>
  </Col>
      </Row>
    </>
  }}
  </Query></div></Col>
)

export default OrderPage

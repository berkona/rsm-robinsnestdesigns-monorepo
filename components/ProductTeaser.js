import React from "react"
import Link from 'next/link'
import { Query } from 'react-apollo'
import Loader from 'react-loaders'
import gql from 'graphql-tag'

export const pageQuery = gql`
query($id: Int!) {
  product(productId: $id) {
    id
    name
    price
    salePrice
    saleStart
    saleEnd
    description
    thumbnail
  }
}
`

const IsWithinDateRange = (timestamp, rangeStart, rangeEnd) => {
  return timestamp > Date.parse(rangeStart) && timestamp < Date.parse(rangeEnd)
}

const ProductTeaser = (props) => (
  <div className="ProductTeaser" key={props.id}>
  <Query query={pageQuery} variables={{ id: props.id }}>
  {({ loading, error, data }) => {
    if (loading) return <Loader type="ball-scale-ripple-multiple" />
    if (error) return <div>Error fetching data: {error}</div>
    const isOnSale = data.product.salePrice > 0 && IsWithinDateRange(Date.now(), data.product.saleStart, data.product.saleEnd)
    return (
      <table style={{ marginBottom: '17px' }} className="item" width="100%" border="1" cellSpacing="0" cellPadding="5" bordercolor="Black">
      <tbody>
        <tr className="odd" bgcolor="#E9EDF9">
          <td width="75%" valign="top">
            <table className="description" width="100%" border="0" cellSpacing="0" cellPadding="5">
              <tbody>
                <tr>
                	<td>
                    <font color="#000000">
                      <Link href={`/product?productId=${props.id}`} as={`/product/${props.id}`}>
                        <a>{data.product.name}</a>
                      </Link>
                    </font>
                  </td>
                  {
                    isOnSale
                    ?
                    (
                      <td align="right" valign="top"><font color="#000000">
                    	    <font color="#CC0000"><span class="onSale">This item is on sale.</span></font>
                    	  </font>
                      </td>
                    )
                    :
                    <td align="right" valign="top"></td>
                  }
                </tr>
                <tr>
  	              <td colSpan="2">
                    {
                      (data.product.thumbnail || data.product.image) ? (
                        <Link href={`/product?productId=${props.id}`} as={`/product/${props.id}`}>
                          <a>
                            <img src={`http://www.robinsnestdesigns.com/ahpimages/${data.product.thumbnail || data.product.image}`} border="0" alt="Product thumbnail" align="LEFT"></img>
                          </a>
                        </Link>
                      ) : <span></span>
                    }
                    {data.product.description}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
  	      <td width="25%">
            <table className="purchase" width="100%" border="0" cellSpacing="0" cellPadding="0">
              <tbody>
                <tr>
                  <td>
                    <form action="add_to_cart.cfm" method="POST">
                      <div align="CENTER">
                        <font color="#000000">
                          <strong>Your Price:</strong> ${data.product.price.toFixed(2)}
                          <br></br>
                          {isOnSale ? (
                            <span>Sale Price: <font color="#CC0000">${data.product.salePrice.toFixed(2)}</font></span>
                          ) : (
                            <span></span>
                          )}
                        </font>
                      </div>
                      <div align="center">
                      <table border="0" cellSpacing="0" cellPadding="0">
                      <tbody>
                        <tr><td><div align="CENTER"><font color="#000000"></font></div></td></tr>
                        <tr><td><div align="CENTER"><font color="#000000"></font></div></td></tr>
                        <tr>
                          <td align="right">
                            <div align="CENTER">
                              <font color="#000000">
                              <b>Qty:</b>
                              <input type="text" name="Quantity" value="1" size="2" maxLength="4" />
                          	  </font>
                            </div>
  	                      </td>
                        </tr>
                    <tr><td></td></tr>
  </tbody></table>
  </div>
  <font color="#000000">

  <br></br>
  <div align="CENTER">
  </div>
  </font>
  </form>

  </td>
  </tr>
  </tbody></table>
  	</td>
        </tr>
      </tbody>
    </table>
  )
  }}
  </Query>
  </div>
)

export default ProductTeaser

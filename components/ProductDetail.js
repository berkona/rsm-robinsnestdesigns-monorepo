import React from 'react'
import Link from 'next/link'
import { Query } from 'react-apollo'
import Loader from 'react-loaders'
import gql from 'graphql-tag'

export const pageQuery = gql`
query($id: Int!) {
  product(productId: $id) {
    id,
    name
    category
    subcategory
    sku
    price
    image
    thumbnail
  }
}
`

const ProductDetail = (props) => (
  <Query key={props.productId} query={pageQuery} variables={{ id: Number.parseInt(props.productId) }}>
  {({ loading, error, data}) => {
    if (loading) return <Loader type="ball-scale-ripple-multiple" />
    if (error) return <div>Error fetching product: {error.toString()}</div>
    return (
      <div id="detail">
      <div align="CENTER"><h1>Detailed Item Information</h1></div>
      <div align="center">
      <hr width="400" size="2" color="Black"></hr>
      <div align="center" className="description">
        <table width="500">
          <tbody><tr>
            <td align="RIGHT"><b><font size="+1">Item Name: </font></b></td>
            <td align="LEFT"><i><font size="+1">{data.product.name}</font></i></td>
          </tr>
          <tr>
            <td align="RIGHT"><b>Category:</b></td>
            <td align="LEFT">{data.product.category}</td>
          </tr>
          <tr>
            <td align="RIGHT"><b>Sub-Category:</b></td>
            <td align="LEFT">{data.product.subcategory}</td>
          </tr>

            <tr>
              <td align="RIGHT"><b>Item Number:</b></td>
              <td align="LEFT">{data.product.sku}</td>
            </tr>

            <tr>
              <td align="RIGHT"><b>Your Price:</b></td>
              <td align="LEFT">${data.product.price.toFixed(2)}</td>
            </tr>

            <tr>
              <td colSpan="2">
                  {
                    (data.product.image || data.product.thumbnail) ?
                    <div align="center"><img src={`http://www.robinsnestdesigns.com/ahpimages/${data.product.image || data.product.thumbnail}`} border="0" alt=""></img></div>
                    : <div></div>
                  }
                 </td>
            </tr>

          <tr>
            <td colSpan="2"><b></b></td>
          </tr>
        </tbody></table>
      </div>
      <hr width="400" size="2" color="Black"></hr>
      <form action="add_to_cart.cfm" method="POST">

      <div align="CENTER">
        <table cellSpacing="0" cellPadding="0">

          <tbody><tr>
            <td colSpan="2"><div align="CENTER"><b>Qty:</b>
                <input type="text" name="Quantity" value="1" size="2" maxLength="4" />
              </div></td>
          </tr>
        </tbody></table>
      </div>




      <table cellSpacing="0" cellPadding="0">
        <tbody><tr>
          <td> <div align="center">
              <input type="Image" name="Submit" src="http://www.robinsnestdesigns.com/ahpimages/buttons/addtocart1.gif" border="0" />
            </div></td>
        </tr>
        </tbody></table>
        </form>

        </div>

      <hr width="400" size="2" color="Black"></hr>
      <div align="center"><b><a href="search.cfm">Search for another product</a></b><br></br>
        <br></br>
      </div>
      </div>
    )
  }}
</Query>

)

export default ProductDetail

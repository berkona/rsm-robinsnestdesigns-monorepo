import React from "react"
import { ProductLink } from "./Links"

const IsWithinDateRange = (timestamp, rangeStart, rangeEnd) => {
  return timestamp > rangeStart && timestamp < rangeEnd
}

const ProductTeaser = (props) => {
    let parseDate = (dateStr) => {
      try {
        return Number.parseInt(dateStr)
      } catch (err) {
        return Date.parse(dateStr)
      }
    }
    const isOnSale = props.product.salePrice > 0 && IsWithinDateRange(Date.now(), parseDate(props.product.saleStart), parseDate(props.product.saleEnd))
    return (
      <ProductLink productId={props.product.id} category={props.product.category} subcategory={props.product.subcategory} title={props.product.name}>
        <a>
          <div className="product-teaser">
            <div className="product-thumbnail">
              {
                (props.product.hyperlinkedImage || props.product.thumbnail || props.product.image)
                ? <img src={props.product.hyperlinkedImage || `https://www.robinsnestdesigns.com/ahpimages/${props.product.thumbnail || props.product.image}`}></img>
                : <img src="/static/no-image.png"/>
              }
            </div>
            <h3 className="product-teaser-title">{props.product.name}</h3>
            <div className="product-teaser-price">
              {
                isOnSale
                ? <span className="large-price on-sale">${props.product.salePrice.toFixed(2)}</span>
                : <span className="large-price">${props.product.price.toFixed(2)}</span>
              }
              {
                isOnSale
                ? <div className="promo-details"><span className="small-price">${props.product.price.toFixed(2)}</span><span> ({ ((1.0 - (props.product.salePrice / props.product.price)) * 100.0).toFixed(0) }% off)</span></div>
                : <span></span>
              }
            </div>
          </div>
        </a>
      </ProductLink>
    )

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
                      <ProductLink productId={props.product.id} category={props.product.category} subcategory={props.product.subcategory} title={props.product.name}>
                        <a>{props.product.name}</a>
                      </ProductLink>
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
                      (props.product.thumbnail || props.product.image) ? (
                        <ProductLink productId={props.product.id}>
                          <a>
                            <img src={`http://www.robinsnestdesigns.com/ahpimages/${props.product.thumbnail || props.product.image}`} border="0" alt="Product thumbnail" align="LEFT"></img>
                          </a>
                        </ProductLink>
                      ) : <span></span>
                    }
                    {props.product.description}
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
                          <strong>Your Price:</strong> ${props.product.price.toFixed(2)}
                          <br></br>
                          {isOnSale ? (
                            <span>Sale Price: <font color="#CC0000">${props.product.salePrice.toFixed(2)}</font></span>
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
}

export default ProductTeaser

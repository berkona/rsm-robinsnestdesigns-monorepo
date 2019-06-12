import React from "react"
import { ProductLink } from "./Links"
import PriceDisplay from './PriceDisplay'

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
            <PriceDisplay product={props.product} isOnSale={isOnSale} />
          </div>
        </a>
      </ProductLink>
    )
}

export default ProductTeaser

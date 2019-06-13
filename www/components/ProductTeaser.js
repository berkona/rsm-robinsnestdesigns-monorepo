import React from "react"
import { ProductLink } from "./Links"
import PriceDisplay from './PriceDisplay'

const ProductTeaser = (props) => {
    const isOnSale = props.product.isOnSale
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

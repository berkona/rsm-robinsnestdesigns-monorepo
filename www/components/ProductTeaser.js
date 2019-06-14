import React from "react"
import { ProductLink } from "./Links"
import PriceDisplay from './PriceDisplay'
import { Impression } from '../lib/next-ga-ec'

const ProductTeaser = (props) => {
    const isOnSale = props.product.isOnSale
    return (
      <ProductLink productId={props.product.id} sku={props.product.sku} category={props.product.category} subcategory={props.product.subcategory} title={props.product.name} listName={props.listName} position={props.position}>
        <Impression sku={props.product.sku}
                    name={props.product.name}
                    category={`${props.product.category}/${props.product.subcategory}`}
                    list={props.listName}
                    position={props.position}
        />
        <div className="product-teaser">
          <div className="product-thumbnail">
            {
              (props.product.hyperlinkedImage || props.product.thumbnail || props.product.image)
              ? <img src={props.product.hyperlinkedImage || `https://www.robinsnestdesigns.com/ahpimages/${props.product.image || props.product.thumbnail}`}></img>
              : <img src="/static/no-image.png"/>
            }
          </div>
          <h3 className="product-teaser-title">{props.product.name}</h3>
          <PriceDisplay product={props.product} isOnSale={isOnSale} />
        </div>
      </ProductLink>
    )
}

export default ProductTeaser

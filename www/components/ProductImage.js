import React from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component';

const ImgComp = (props) => <img {...props} />

const ProductImage = (props) => {
  let SelectedComponent = props.lazy || props.lazy === undefined
    ? LazyLoadImage : ImgComp
  let productUrl = props.product.hyperlinkedImage || props.product.thumbnail || props.product.image
    ? props.product.hyperlinkedImage || `https://www.robinsnestdesigns.com/ahpimages/${props.product.image || props.product.thumbnail}`
    : null
  return (productUrl)
    ? <SelectedComponent {...props.imgProps} src={productUrl} alt={props.product.name} onError={(e) => { e.target.onerror = null; e.target.src="/static/no-image.png" }}/>
    : <SelectedComponent {...props.imgProps} src="/static/no-image.png" alt="No image"/>
}

export default ProductImage

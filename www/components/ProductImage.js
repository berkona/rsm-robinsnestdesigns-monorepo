import React from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { NO_IMAGE_URL } from '../constants/config'

const ImgComp = (props) => <img {...props} />

const ProductImage = (props) => {
  let SelectedComponent = props.lazy || props.lazy === undefined
    ? LazyLoadImage : ImgComp
  let productUrl = props.product.hyperlinkedImage || props.product.thumbnail || props.product.image
    ? props.product.hyperlinkedImage || `https://www.robinsnestdesigns.com/ahpimages/${props.product.image || props.product.thumbnail}`
    : null
  return (productUrl)
    ? <SelectedComponent {...props.imgProps} src={productUrl} alt={props.product.name} onError={(e) => { e.target.onerror = null; e.target.src=NO_IMAGE_URL }}/>
    : <SelectedComponent {...props.imgProps} src={NO_IMAGE_URL} alt="No image"/>
}

export default ProductImage

import React from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component';

const ImgComp = (props) => <img {...props} />

const ProductImage = (props) => {
  let SelectedComponent = props.lazy || props.lazy === undefined
    ? LazyLoadImage : ImgComp
  return (props.product.hyperlinkedImage || props.product.thumbnail || props.product.image)
    ? <SelectedComponent {...props.imgProps} src={props.product.hyperlinkedImage || `https://www.robinsnestdesigns.com/ahpimages/${props.product.image || props.product.thumbnail}`} alt={props.product.name}/>
    : <SelectedComponent {...props.imgProps} src="/static/no-image.png" alt="No image"/>
}

export default ProductImage

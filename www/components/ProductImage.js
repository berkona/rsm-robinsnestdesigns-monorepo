import React from 'react'

export default (props) => {
  const url = props.product.hyperlinkedImage
    ? props.product.hyperlinkedImage
    : props.product.image
      ? `https://www.robinsnestdesigns.com/ahpimages/${props.product.image}`
      : props.product.thumbnail
        ? `https://www.robinsnestdesigns.com/ahpimages/${props.product.thumbnail}`
        : '/static/no-image.png'
  return <img style={{ maxWidth: '100%', maxHeight: '100%' }} src={url} alt={'Image of ' + props.product.name} />
}

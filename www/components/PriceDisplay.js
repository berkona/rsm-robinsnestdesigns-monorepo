import React from 'react'

const ProductTeaserPrice = {
    fontSize: '20px',
    fontWeight: '400',
    color: '#222',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
}

const ProductTeaserPrice_OnSale = {
  color: '#CC3300'
}

const ProductTeaserPrice_PromoDetails = {
  fontSize: '12px',
  display: 'inline',
  marginLeft: '3px',
}

const ProductTeaserPrice_SmallPrice = {
    textDecoration: 'line-through'
}

export default (props) => {
  if (props.product.productVariants && props.product.productVariants.length > 0) {
    const lowestPrice = props.product.productVariants.sort((a, b) => a.price - b.price)[0].price.toFixed(2)
    return <div style={ProductTeaserPrice}>
      <>
        <span>${lowestPrice}+</span>
        <span></span>
      </>
    </div>
  } else {
    return <div style={ProductTeaserPrice}>
      {props.isOnSale
          ? <>
              <span style={ProductTeaserPrice_OnSale}>${props.product.salePrice.toFixed(2)}</span>
              <div style={ProductTeaserPrice_PromoDetails}>
                <span style={ProductTeaserPrice_SmallPrice}>${props.product.price.toFixed(2)}</span>
                <span> ({ ((1.0 - (props.product.salePrice / props.product.price)) * 100.0).toFixed(0) }% off)</span>
              </div>
            </>
          : <>
              <span>${props.product.price.toFixed(2)}</span>
              <span></span>
            </>
      }
    </div>
  }
}

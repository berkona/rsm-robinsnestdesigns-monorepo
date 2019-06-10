import React from 'react'
import { Query } from 'react-apollo'
import Loader from './Loader'
import gql from 'graphql-tag'
import SEO from './SEO'
import Breadcrumb from './Breadcrumb'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Link from 'next/link'
import ProductList from './ProductList'
import AddToCart from './AddToCart'

export const pageQuery = gql`
query($id: ID!) {
  product(productId: $id) {
    id
    name
    qtyInStock
    category
    categoryId
    subcategory
    subcategoryId
    sku
    price
    salePrice
    saleStart
    saleEnd
    image
    thumbnail
    hyperlinkedImage
    description
  }
}
`

const IsWithinDateRange = (timestamp, rangeStart, rangeEnd) => {
  return timestamp > rangeStart && timestamp < rangeEnd
}

const ProductDetail = (props) => (
  <Query key={props.productId} query={pageQuery} variables={{ id: Number.parseInt(props.productId) }}>
  {({ loading, error, data}) => {
    if (loading) return <Loader />
    if (error) return <div>Error fetching product: {error.toString()}</div>
    const parseDate = (dateStr) => {
      try {
        return Number.parseInt(dateStr)
      } catch (err) {
        return Date.parse(dateStr)
      }
    }
    const isOnSale = data.product.salePrice > 0 && IsWithinDateRange(Date.now(), parseDate(data.product.saleStart), parseDate(data.product.saleEnd))
    const shippingTime = data.product.qtyInStock > 0 ? 'Ships in 1-2 business days' : 'Order by Tuesday at 12 PM EST'
    return (
      <div className="product-detail">
      <SEO
        title={data.product.name + ' | ' + data.product.category + ' | ' + data.product.subcategory}
        description={'Buy ' + data.product.name + ' now. ' + data.product.description}
      />
      <Row>
        <Col>
          <Breadcrumb query={{categoryId: data.product.categoryId, subcategoryId: data.product.subcategoryId, product: data.product }} />
        </Col>
      </Row>
      <Row>
        <Col xs={12} md={7}>
          <div style={{  padding: '0px 24px' }}>
            <div className="product-large-image">
              {
                (data.product.hyperlinkedImage || data.product.thumbnail || data.product.image)
                ? <img src={data.product.hyperlinkedImage || `https://www.robinsnestdesigns.com/ahpimages/${data.product.thumbnail || data.product.image}`}></img>
                : <img src="/static/no-image.png"/>
              }
            </div>
          </div>
        </Col>
        <Col xs={12} md={5}>
          <div style={{  padding: '0px 24px' }}>
            <h3 className="product-title">{data.product.name}</h3>
            <div className="product-price" style={{ marginBottom: '5px' }}>
              {
                isOnSale
                ? <span className="large-price on-sale">${data.product.salePrice.toFixed(2)}</span>
                : <span className="large-price">${data.product.price.toFixed(2)}</span>
              }
              {
                isOnSale
                ? <div className="promo-details"><span className="small-price">${data.product.price.toFixed(2)}</span><span> ({ ((1.0 - (data.product.salePrice / data.product.price)) * 100.0).toFixed(0) }% off)</span></div>
                : <span></span>
              }
            </div>

            <AddToCart productId={data.product.id} />

            <hr style={{ color: '#888' }} />
            <h2>Shipping</h2>
            <p>{shippingTime}</p>
            <p><Link href="/ShippingInfo/shipping"><a>See shipping policy</a></Link></p>

            <hr style={{ color: '#888' }} />
            <h2>Returns</h2>
            <p>Returns and exchanges accepted</p>
            <p><Link href="/Policies/Policies"><a>See return policy</a></Link></p>
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <div style={{ padding: '0px 24px' }}>
            <h1>Description</h1>
            <p dangerouslySetInnerHTML={{__html: data.product.description }}></p>
            <hr style={{ color: '#888' }} />
            <h1>Related Items</h1>
            <ProductList isTeaser={true} limit={8} categoryId={data.product.categoryId} subcategoryId={data.product.subcategoryId} sortOrder="random" />
          </div>
        </Col>
      </Row>
      </div>
    )
  }}
</Query>

)

export default ProductDetail

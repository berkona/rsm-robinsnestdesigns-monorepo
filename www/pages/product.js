import React from 'react'
import Col from 'react-bootstrap/Col'
import ProductDetail from '../components/ProductDetail'
import { PageViewEvent } from '../lib/react-ga'
import { withRouter } from 'next/router'

const ProductPage = withRouter((props) => (
  <Col>
    <ProductDetail productId={props.router.query.productId} />
    <PageViewEvent />
  </Col>
))

export default ProductPage

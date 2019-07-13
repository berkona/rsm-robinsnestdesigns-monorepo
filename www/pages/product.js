import React from 'react'
import ProductDetail from '../components/ProductDetail'
import ContentWithSidebar from '../components/ContentWithSidebar'
import { withRouter } from 'next/router'

const ProductPage = withRouter((props) => (
  <ContentWithSidebar>
    <ProductDetail productId={props.router.query.productId} listref={props.router.query.listref}/>
  </ContentWithSidebar>
))

export default ProductPage

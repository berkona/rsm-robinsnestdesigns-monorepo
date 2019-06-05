import Col from 'react-bootstrap/Col'
import ProductDetail from '../components/ProductDetail'

import { withRouter } from 'next/router'

const ProductPage = withRouter((props) => (
  <Col>
    <ProductDetail productId={props.router.query.productId} />
  </Col>
))

export default ProductPage

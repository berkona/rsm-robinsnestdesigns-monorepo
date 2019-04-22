import ProductDetail from '../components/ProductDetail'

import { withRouter } from 'next/router'

const ProductPage = withRouter((props) => (
  <ProductDetail productId={props.router.query.productId} />
))

export default ProductPage

import ProductList from '../components/ProductList'

import { withRouter } from 'next/router'

const Subcategory = withRouter((props) => (
  <ProductList subcategoryId={props.router.query.subcategoryId} page={props.router.query.pageNo} />
))

export default Subcategory

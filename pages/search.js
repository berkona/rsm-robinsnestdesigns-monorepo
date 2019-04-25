import ProductList from '../components/ProductList'
import SearchBlock from '../components/SearchBlock'

import { withRouter } from 'next/router'

const SearchPage = withRouter((props) => (
  <div id="results">
    <SearchBlock
      searchPhrase={props.router.query.searchPhrase}
      categoryId={props.router.query.categoryId}
      subcategoryId={props.router.query.subcategoryId}
      onSaleOnly={props.router.query.onSaleOnly}
      newOnly={props.router.query.newOnly}
    />
    <ProductList
      searchPhrase={props.router.query.searchPhrase}
      categoryId={props.router.query.categoryId}
      subcategoryId={props.router.query.subcategoryId}
      onSaleOnly={props.router.query.onSaleOnly}
      newOnly={props.router.query.newOnly}
      page={props.router.query.pageNo}
    />
  </div>
))

export default SearchPage

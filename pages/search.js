import ProductList from '../components/ProductList'

import { withRouter } from 'next/router'

const SearchPage = withRouter((props) => (
  <div id="results">
  <h1>Search Results</h1>
  <ProductList
    searchPhrase={props.router.query.searchPhrase}
    subcategoryId={props.router.query.subcategoryId}
    page={props.router.query.pageNo}
  />
  </div>
))

export default SearchPage

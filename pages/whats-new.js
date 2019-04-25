import ProductList from '../components/ProductList'

import { withRouter } from 'next/router'

const SearchPage = withRouter((props) => (
  <div id="whatsnew">
    <h1>What's New?</h1>
    <p>The items below have been added to our catalog in the past 60 days... and generally if
it's new, it's on sale!</p>
    <ProductList
      newOnly={true}
      page={props.router.query.pageNo}
    />
  </div>
))

export default SearchPage

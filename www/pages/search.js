import Col from 'react-bootstrap/Col'
import Sidebar from '../components/Sidebar'
import ProductList from '../components/ProductList'
import SearchBlock from '../components/SearchBlock'
import Breadcrumb from '../components/Breadcrumb'
import SortWidget from '../components/SortWidget'
import { withRouter } from 'next/router'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import SEO from '../components/SEO'
import { PageViewEvent } from '../lib/react-ga'

export const seoQuery = gql`
query($categoryId: ID!) {
  category(categoryId: $categoryId) {
    title
    comments
  }
  allSubcategories(categoryId: $categoryId) {
    id
    title
    comments
  }
}
`

const SearchPageSEO = (props) => {
    const makeTitle = (searchPhrase, category, subcategory) => {
      let ret = []
      if (searchPhrase) {
        ret.push(searchPhrase)
      }
      if (subcategory) {
        ret.push(subcategory)
      }
      if (category) {
        ret.push(category)
      }

      if (ret.length == 0) {
        ret.push('All cross-stitch items');
      }
      return ret.join(' | ')
    }

    const makeDescription = (searchPhrase, category, subcategory) => {
      if (searchPhrase) {
        return 'Check out our exclusive selection of ' + searchPhrase + ' items now.'
      }
      else if (subcategory) {
        return 'Check out our exclusive selection of ' + subcategory + ' items now.'
      }
      else if (category) {
        return 'Check out our exclusive selection of ' + category + ' items now.'
      }
      else {
        return 'Check out our exclusive selection of cross stitch items now.'
      }
    }

    if (props.categoryId) {
      return <Query query={seoQuery} variables={{ categoryId: props.categoryId}}>
      {({ loading, error, data }) => {
        if (loading || error || !data) {
          return <></>
        }
        else {
          const subcategory = props.subcategoryId ? data.allSubcategories.filter((x) => x.id == props.subcategoryId)[0].title : null
          return <SEO title={makeTitle(props.searchPhrase, data.category.title, subcategory)} description={makeDescription(props.searchPhrase, data.category.title, subcategory)}/>
        }
      }}
      </Query>
    } else {
      return <SEO title={makeTitle(props.searchPhrase)} description={makeDescription(props.searchPhrase) || description} />
    }
}

const SearchPage = withRouter((props) => (
  <>
    <SearchPageSEO {...props.router.query} />
    <Col className="d-none d-sm-block" sm={6} md={3}>
      <Sidebar>
        <div style={{ padding: '10px' }}>
          <SearchBlock
            searchPhrase={props.router.query.searchPhrase}
            categoryId={props.router.query.categoryId}
            subcategoryId={props.router.query.subcategoryId}
            onSaleOnly={props.router.query.onSaleOnly}
            newOnly={props.router.query.newOnly}
            sortOrder={props.router.query.sortOrder}
          />
        </div>
      </Sidebar>
    </Col>
    <Col id="content" xs={12} sm={6} md={9}>
      <div className="clearfix" style={{ marginTop: '10px' }}>
        <div className="float-left">
          <Breadcrumb query={props.router.query} />
        </div>
        <div className="float-right">
          <SortWidget />
        </div>
      </div>
      <div id="results">
        <ProductList
          searchPhrase={props.router.query.searchPhrase}
          categoryId={props.router.query.categoryId}
          subcategoryId={props.router.query.subcategoryId}
          onSaleOnly={props.router.query.onSaleOnly}
          newOnly={props.router.query.newOnly}
          page={props.router.query.pageNo}
          sortOrder={props.router.query.sortOrder}
          listName={'Search Results'}
        />
      </div>
    </Col>
    <PageViewEvent />
  </>
))

export default SearchPage

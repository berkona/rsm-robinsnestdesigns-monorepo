import Col from 'react-bootstrap/Col'
import Sidebar from '../components/Sidebar'
import ProductList from '../components/ProductList'
import SearchBlock from '../components/SearchBlock'
import Breadcrumb from '../components/Breadcrumb'
import SortWidget from '../components/SortWidget'
import { withRouter } from 'next/router'

const SearchPage = withRouter((props) => (
  <>
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
        />
      </div>
    </Col>
  </>
))

export default SearchPage

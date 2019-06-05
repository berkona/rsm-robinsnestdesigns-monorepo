import Col from 'react-bootstrap/Col'
import Sidebar from '../components/Sidebar'
import CategoryLinks from '../components/CategoryLinks'
import ProductList from '../components/ProductList'
import { SearchLink } from '../components/Links'

const Index = (props) => (
  <>
    <Col className="d-none d-sm-block" sm={6} md={3}>
      <Sidebar>
        <CategoryLinks />
      </Sidebar>
    </Col>
    <Col id="content" xs={12} sm={6} md={9}>
      <h1>Welcome to the finest selection of needlework supplies in our 40,000+ item online catalog!</h1>
      <div id="homeContent">
        <SearchLink onSaleOnly={true} sortOrder="mostRecent">
          <a><h2>On Sale</h2></a>
        </SearchLink>
        <ProductList isTeaser={true} onSaleOnly={true} sortOrder="random" limit={8} />

        <SearchLink newOnly={true} sortOrder="mostRecent">
          <a><h2>What's New</h2></a>
        </SearchLink>
        <ProductList isTeaser={true} newOnly={true} sortOrder="random" limit={8} />

        <SearchLink categoryId={215} sortOrder="mostRecent">
          <a><h2>New in the Bargin Bin</h2></a>
        </SearchLink>
        <ProductList isTeaser={true} sortOrder="random" categoryId={215} limit={8} />
      </div>
    </Col>
  </>
)

export default Index

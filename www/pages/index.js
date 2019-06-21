import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Sidebar from '../components/Sidebar'
import CategoryLinks from '../components/CategoryLinks'
import ProductList from '../components/ProductList'
import { SearchLink } from '../components/Links'
import Jumbotron from 'react-bootstrap/Jumbotron'
import Carousel from 'react-bootstrap/Carousel'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Loader from '../components/Loader'
import ApolloError from '../components/ApolloError'
import PriceDisplay from '../components/PriceDisplay'
import { Impression } from '../lib/next-ga-ec'
import { ProductLink} from '../components/Links'

const FIND_ONE_PRODUCT = gql`
query($categoryId: ID, $onSaleOnly: Boolean, $newOnly: Boolean) {
  allProducts(categoryId: $categoryId, onSaleOnly: $onSaleOnly, newOnly: $newOnly, limit: 1, sort: random) {
    records {
      id
      sku
      category
      subcategory
      hyperlinkedImage
      name
      description
      isOnSale
      price
      salePrice
      productVariants {
        price
      }
    }
  }
}
`

const ProductCarouselItem = (props) => <Query query={FIND_ONE_PRODUCT} variables={props.variables}>
  {({ loading, error, data }) => {
    if (loading) return <Loader />
    if (error) return <ApolloError error={error} />
    const [ product ] = data.allProducts.records
    return <ProductLink productId={product.id}
                 sku={product.sku}
                 category={product.category}
                 subcategory={product.subcategory}
                 title={product.name}
                 listName={"Index - Banner"}
                 position={1}>

      <Impression sku={product.sku}
                  name={product.name}
                  category={`${product.category}/${product.subcategory}`}
                  list={"Index - Banner"}
                  position={1}
      />
      <div style={{ height: '300px' }}>
        {props.header}
        <Row>
          <Col md={6}>
            <div style={{ width: '100%', height: '100%', position: 'absolute', top: '0', left: '0' }}>
              <img style={{ height: '240px' }} src={product.hyperlinkedImage} alt={"Picture of " + product.name}/>
            </div>
          </Col>
          <Col md={6}>
            <h3>{product.name}</h3>
            <PriceDisplay product={product} isOnSale={product.isOnSale} />
            <p style={{ color: '#333' }}>{product.description}</p>
          </Col>
        </Row>
      </div>
    </ProductLink>
  }}
</Query>

const Index = (props) => (
  <>
    <Col className="d-none d-sm-block" sm={6} md={3}>
      <Sidebar>
        <div style={{ padding: '5px 10px 5px 10px' }}>
          <CategoryLinks />
        </div>
      </Sidebar>
    </Col>
    <Col id="content" xs={12} sm={6} md={9}>
      <div id="homeContent" style={{ paddingLeft: '10px', paddingRight: '10px' }}>
        <Jumbotron style={{ border: '1px solid #888', backgroundColor: '#FFFFFc', marginTop: '16px', marginBottom: '16px', padding: '1rem 2rem' }}>
          <Carousel controls={false}>
            <Carousel.Item><ProductCarouselItem
              variables={{ categoryId: 220 }}
              header={
                <h2>Featured Item</h2>
              }
            />
            </Carousel.Item>
            <Carousel.Item>
            <ProductCarouselItem
              variables={{ onSaleOnly: true }}
              header={
                <h2>On Sale</h2>
              }
            />
            </Carousel.Item>
            <Carousel.Item>
            <ProductCarouselItem
              variables={{ newOnly: true }}
              header={
                <h2>Recently Added</h2>
              }
            />
            </Carousel.Item>
          </Carousel>
        </Jumbotron>

      <div>
          <SearchLink onSaleOnly={true} sortOrder="mostRecent">
            <a><h2>On Sale</h2></a>
          </SearchLink>
          <ProductList isTeaser={true} onSaleOnly={true} sortOrder="random" limit={8} listName={'Index - On Sale'} />

          <SearchLink newOnly={true} sortOrder="mostRecent">
            <a><h2>What's New</h2></a>
          </SearchLink>
          <ProductList isTeaser={true} newOnly={true} sortOrder="random" limit={8} listName={'Index - Whats New'} />

          <SearchLink categoryId={215} sortOrder="mostRecent">
            <a><h2>In The Bargin Bin</h2></a>
          </SearchLink>
          <ProductList isTeaser={true} sortOrder="random" categoryId={215} limit={8} listName={'Index - New in Bargin Bin'} />
        </div>
      </div>
    </Col>
  </>
)

export default Index

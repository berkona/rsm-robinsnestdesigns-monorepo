import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Sidebar from '../components/Sidebar'
import CategoryLinks from '../components/CategoryLinks'
import ProductList from '../components/ProductList'
import { SearchLink } from '../components/Links'
import Carousel from 'react-bootstrap/Carousel'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Loader from '../components/Loader'
import ApolloError from '../components/ApolloError'
import PriceDisplay from '../components/PriceDisplay'
import { Impression } from '../lib/next-ga-ec'
import { ProductLink} from '../components/Links'
import ProductImage from '../components/ProductImage'
import { resolve } from 'url'

const FIND_ONE_PRODUCT = gql`
query($categoryId: ID, $onSaleOnly: Boolean, $newOnly: Boolean) {
  allProducts(categoryId: $categoryId, onSaleOnly: $onSaleOnly, newOnly: $newOnly, limit: 1, sort: random) {
    records {
      id
      sku
      category
      subcategory
      hyperlinkedImage
      image
      thumbnail
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
      <div style={{ height: '340px' }}>
        {props.header}
        <Row style={{ height: '220px' }}>
          <Col md={6} style={{ height: '100%' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'left' }}>
              <ProductImage lazy={false} imgProps={{ style: { maxWidth: '100%', height: '100%' } }} product={product} />
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
          <Carousel controls={false} style={{ marginTop: '16px' }}>
            {props.carouselItems.map((url, i) => <Carousel.Item key={url}>
              <div style={{ height: '340px' }} dangerouslySetInnerHTML={{ __html: props['carouselItem-' + i + '-html'] }}>
              </div>
            </Carousel.Item>)}
          </Carousel>
          <hr />
      <div>
          <SearchLink onSaleOnly={true} sortOrder="mostRecent">
            <a><h2>On Sale</h2></a>
          </SearchLink>
          <ProductList isTeaser={true} onSaleOnly={true} sortOrder="random" limit={8} listName={'Index - On Sale'} />
          <hr />

          <SearchLink newOnly={true} sortOrder="mostRecent">
            <a><h2>What's New</h2></a>
          </SearchLink>
          <ProductList isTeaser={true} newOnly={true} sortOrder="random" limit={8} listName={'Index - Whats New'} />

          <hr />

          <SearchLink categoryId={215} sortOrder="mostRecent">
            <a><h2>In The Bargain Bin</h2></a>
          </SearchLink>
          <ProductList isTeaser={true} sortOrder="random" categoryId={215} limit={8} listName={'Index - New in Bargin Bin'} />
          <hr />

        </div>
      </div>
    </Col>
  </>
)

const BASE_URL = process.env.SITE_URL || 'http://localhost:3000/'

Index.getInitialProps = async () => {
  const indexRes = await fetch(resolve(BASE_URL, '/content/home/index.json'))
  const indexData = await indexRes.json()
  let initialProps = {
    carouselItems: indexData.items || []
  }
  for (let i = 0; i < initialProps.carouselItems.length; i++) {
    let fName = initialProps.carouselItems[i]
    const res = await fetch(resolve(BASE_URL, '/content/home/' + fName))
    const data = await res.text()
    let propName = 'carouselItem-' + i + '-html'
    initialProps[propName] = data
  }
  return initialProps
}

export default Index

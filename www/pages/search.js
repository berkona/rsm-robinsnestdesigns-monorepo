import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Sidebar from '../components/Sidebar'
import ProductList from '../components/ProductList'
import SearchBlock from '../components/SearchBlock'
import Breadcrumb from '../components/Breadcrumb'
import SortWidget from '../components/SortWidget'
import { withRouter } from 'next/router'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import SEO from '../components/SEO'
import { PRODUCT_GET_PAGE } from '../constants/queries'
import Button from 'react-bootstrap/Button'
import { FaTimes, FaPlus } from 'react-icons/fa'
import { SearchLink } from '../components/Links'

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

const TokenizeStr = (str) => {
  return str && str.split(' ').map(s => {
    return s && s.trim().replace(/\W+/g, '')
  }).filter(s => s && s.length) || []
}

const DEFAULT_KEYWORDS = 'cross,stitch,needlepoint,quilting,punchneedle,patterns,charts,graphs,needles,DMC,Anchor,Mill,Hill,Pearl,perle,cotton,beads,floss,kits,linen,Aida,Lugana,evenweave,afghans,tabletop,placemats,napkins,bread,covers,cloths,Jubilee,Jobelan,Wichelt,Zweigart,Charles,Kreinik,metallic,threads,Marlitt,Lavender,Lace,Mirabilia,Butternut,Road,nora,Corbett,Marilyn,Imblum,Pooh,Disney,John,James,Piecemakers,tapestry,beading,baby,bibs,towels,bookmark,fabrics,leaflets,books,needlework,stitchery,needlearts,sewing,crafts,keepsakes,collectibles,heirloom,gifts,home,decor,furnishings,flowers,Christmas,ornaments,cats,dogs'.split(',')


const SearchPageKeywords = (products, category, subcategory) => {
  return Array.from(new Set(
    DEFAULT_KEYWORDS
    .concat(TokenizeStr(category))
    .concat(TokenizeStr(subcategory))
    .concat(Array.from(products.reduce((set, product) => {
      for (const token of TokenizeStr(product.name)) {
        set.add(token)
      }
      for (const token of TokenizeStr(product.description)) {
        set.add(token)
      }
      for (const token of TokenizeStr(product.category)) {
        set.add(token)
      }
      for (const token of TokenizeStr(product.subcategory)) {
        set.add(token)
      }
      return set
    }, new Set())))

  )).join(',')
}

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

      if (props.pageNo) {
        ret.push('Page ' + props.pageNo)
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

    return <Query query={PRODUCT_GET_PAGE} variables={{
      searchPhrase: props.searchPhrase,
      categoryId: props.categoryId,
      subcategoryId: props.subcategoryId,
      onSaleOnly: props.onSaleOnly,
      newOnly: props.newOnly,
      sortOrder: props.sortOrder,
      limit: 50,
      skip: ((props.pageNo || 1)-1) * 50,
    }}>
    {({ loading, error, data }) => {
      if (loading || error || !data || !data.allProducts || !data.allProducts.records) {
        return <></>
      }
      const products = data.allProducts.records
      if (props.categoryId) {
        return <Query query={seoQuery} variables={{ categoryId: props.categoryId}}>
        {({ loading, error, data }) => {
          if (loading || error || !data) {
            return <></>
          }
          else {
            let subcategory = props.subcategoryId && data.allSubcategories.filter((x) => x.id == props.subcategoryId)[0]
            subcategory = subcategory && subcategory.title
            return <SEO
              title={makeTitle(props.searchPhrase, data.category.title, subcategory)}
              description={makeDescription(props.searchPhrase, data.category.title, subcategory)}
              keywords={SearchPageKeywords(products, data.category.title, subcategory)}
              />
          }
        }}
        </Query>
      } else {
        return <SEO
          title={makeTitle(props.searchPhrase)}
          description={makeDescription(props.searchPhrase) || description}
          keywords={SearchPageKeywords(products)}
          />
      }
    }}
    </Query>
}

const FilterButtons = ({ searchPhrase, categoryId, subcategoryId, onSaleOnly, newOnly }) => <>
  <style jsx global>{`
  .filter-button {
    display: inline-block;
    margin-bottom: 10px;
    margin-left: 10px;

  }
  .filter-button .btn {
    border-radius: 32px;
  }
  `}</style>
  <div className="filter-button">
  { onSaleOnly
    && <SearchLink searchPhrase={searchPhrase} categoryId={categoryId} subcategoryId={subcategoryId} newOnly={newOnly}>
      <a>
        <Button>
          On Sale Only <FaTimes />
        </Button>
      </a>
    </SearchLink>
    || <SearchLink searchPhrase={searchPhrase} categoryId={categoryId} subcategoryId={subcategoryId} newOnly={newOnly} onSaleOnly={true}>
      <a>
        <Button variant="secondary">
          On Sale Only
        </Button>
      </a>
    </SearchLink>
  }
  </div>
  <div className="filter-button">
  { newOnly
    && <SearchLink searchPhrase={searchPhrase} categoryId={categoryId} subcategoryId={subcategoryId} onSaleOnly={onSaleOnly}>
      <a>
        <Button>
          New Only <FaTimes />
        </Button>
      </a>
    </SearchLink>
    || <SearchLink searchPhrase={searchPhrase} categoryId={categoryId} subcategoryId={subcategoryId} onSaleOnly={onSaleOnly} newOnly={true}>
      <a>
        <Button variant="secondary">
          New Only
        </Button>
      </a>
    </SearchLink>
  }
  </div>
</>

class SearchPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      categories: [],
      subcategories: null,
    }
  }

  render() {
    return   <>
        <SearchPageSEO {...this.props.router.query} />
        <Col className="d-none d-sm-block" sm={6} md={3}>
          <Sidebar>
            <div style={{ padding: '10px' }}>
              <SearchBlock
                categories={this.state.categories}
                subcategories={this.state.subcategories}
                searchPhrase={this.props.router.query.searchPhrase}
                categoryId={this.props.router.query.categoryId}
                subcategoryId={this.props.router.query.subcategoryId}
                onSaleOnly={this.props.router.query.onSaleOnly}
                newOnly={this.props.router.query.newOnly}
                sortOrder={this.props.router.query.sortOrder}
              />
            </div>
          </Sidebar>
        </Col>
        <Col id="content" xs={12} sm={6} md={9}>
          <div className="clearfix" style={{ margin: '16px 0px' }}>
            <div className="float-left">
              <Breadcrumb query={this.props.router.query} />
            </div>
            <div className="float-left">
              <FilterButtons {...this.props.router.query} />
            </div>
            <div className="float-right">
              <SortWidget />
            </div>
          </div>
          <hr />
          <div id="results">
            <ProductList
              searchPhrase={this.props.router.query.searchPhrase}
              categoryId={this.props.router.query.categoryId}
              subcategoryId={this.props.router.query.subcategoryId}
              onSaleOnly={this.props.router.query.onSaleOnly}
              newOnly={this.props.router.query.newOnly}
              page={this.props.router.query.pageNo}
              sortOrder={this.props.router.query.sortOrder}
              listName={'Search Results'}
            />
          </div>
        </Col>
      </>
  }
}

SearchPage = withRouter(SearchPage)

export default SearchPage

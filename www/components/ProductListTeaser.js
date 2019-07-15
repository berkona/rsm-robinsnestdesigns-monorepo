import React from "react"
import { Query } from 'react-apollo'
import { SearchLink } from './Links'
import gql from 'graphql-tag'
import ProductTeaser from './ProductTeaser'
import Loader from './Loader'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

export const pageQuery = gql`
query(
  $categoryId: ID,
  $subcategoryId: ID,
  $searchPhrase: String,
  $onSaleOnly: Boolean,
  $newOnly: Boolean,
  $sort: ProductSortType,
  $skip: Int!,
  $limit: Int!) {
  allProducts(
    categoryId: $categoryId,
    subcategoryId: $subcategoryId,
    searchPhrase: $searchPhrase,
    onSaleOnly: $onSaleOnly,
    newOnly: $newOnly,
    skip: $skip,
    limit: $limit,
    sort: $sort) {
    records {
      id
      sku
      name
      category
      subcategory
      isOnSale
      price
      salePrice
      saleStart
      saleEnd
      description
      image
      thumbnail
      hyperlinkedImage
      productVariants {
        id
        price
      }
    }
  }
}
`

const makePageLink = (page, text) =>
  <font size="-1" key={page}>

  </font>

const ProductListTeaser = (props) => {
  const perPage = Number.parseInt(props.limit) || 50
  const page = Number.parseInt(props.page) || 1
  const variables = {
    categoryId: props.categoryId ? Number.parseInt(props.categoryId) : undefined,
    subcategoryId: props.subcategoryId ? Number.parseInt(props.subcategoryId) : undefined,
    searchPhrase: props.searchPhrase,
    onSaleOnly: !!props.onSaleOnly,
    newOnly: !!props.newOnly,
    skip: (page -1) * perPage, limit: perPage,
    sort: props.sortOrder,
  }

  return (
    <Query query={pageQuery} variables={variables}>
      {
        ({ loading, error, data }) => {
          if (loading) return <Loader />
          if (error) return <div>Error fetching data: {error.toString()}</div>
          return (
            <div id="results">
              <Container>
                <Row>
                  {
                    data.allProducts.records.map((item, idx) => (
                      props.colSize
                      ? <Col xs={props.colSize} key={item.id}><ProductTeaser product={item} position={idx} listName={props.listName || 'ProductList'} /></Col>
                      : <Col sm={12} md={6} lg={4} xl={3} key={item.id}><ProductTeaser product={item} position={idx} listName={props.listName || 'ProductList'} /></Col>
                    ))
                  }
                </Row>
              </Container>
              <div align="left" style={{ marginLeft: '15px', marginTop: '10px', marginBottom: '10px' }}>
                <SearchLink
                searchPhrase={props.searchPhrase}
                categoryId={props.categoryId}
                subcategoryId={props.subcategoryId}
                onSaleOnly={props.onSaleOnly}
                newOnly={props.newOnly}
                sortOrder={'mostRecent'}
                >
                <a>See more...</a>
              </SearchLink>
              </div>
            </div>
          )
        }
      }
    </Query>
  )
}

export default ProductListTeaser

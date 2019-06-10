import React from "react"
import { Query } from 'react-apollo'

import gql from 'graphql-tag'
import ProductTeaser from './ProductTeaser'
import Loader from './Loader'
import { SearchLink } from './Links'
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
    total,
    records {
      id
      name
      category
      subcategory
      price
      salePrice
      saleStart
      saleEnd
      description
      image
      thumbnail
      hyperlinkedImage
    }
  }
}
`

const ProductList = (props) => {
  const isTeaser = !!props.isTeaser
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

          const makePageLink = (page, text) =>
            <font size="-1" key={page}>
              <SearchLink
                searchPhrase={props.searchPhrase}
                categoryId={props.categoryId}
                subcategoryId={props.subcategoryId}
                onSaleOnly={props.onSaleOnly}
                newOnly={props.newOnly}
                pageNo={page}
                sortOrder={props.sortOrder}
              >
                <a>{text}</a>
              </SearchLink>
            </font>

          const total = data.allProducts.total
          const lastPage = Math.ceil(total / perPage)
          const pageLinks = []
          let pageStart = page - 2
          let pageEnd = page + 2
          if (page <= 2) {
            // if page == 1, add 2 to pageStart
            // if page == 2, add 1 to pageStart
            const bump = 3 - page
            pageStart += bump
            pageEnd += bump
          } else if (page + 2 >= lastPage) {
            // if page == lastPage, pageStart == lastPage + 2, sub 2
            // if page == lastPage - 1, pageStart == lastPage + 1, sub 1
            const bump = 2 - (lastPage - page)
            pageStart -= bump
            pageEnd -= bump
          }
          pageStart = Math.max(pageStart, 1)
          pageEnd = Math.min(pageEnd, lastPage)

          if (pageStart != pageEnd) {
            if (pageStart !== 1) pageLinks.push(makePageLink(1, '«'))
            for (var i = pageStart; i <= pageEnd; i++) {
              const txt = ` [ ${(i-1) * perPage + 1} - ${ Math.min(i * perPage, total) } ] `;
              if (i === page) {
                pageLinks.push(<span key={i}>{txt}</span>)
              } else {
                  pageLinks.push(makePageLink(i, txt))
              }
            }
            if (pageEnd !== lastPage) pageLinks.push(makePageLink(lastPage, '»'))
          }

          return (
            <div id="results">
              <Container>
                <Row>
                  {
                    data.allProducts.records.map((item) => (
                      props.colSize
                      ? <Col xs={props.colSize} key={item.id}><ProductTeaser product={item} /></Col>
                      : <Col xs={6} md={4} lg={3} key={item.id}><ProductTeaser key={item.id} product={item} /></Col>
                    ))
                  }
                </Row>
              </Container>
              {
                !isTeaser
                  ? <>
                      <hr align="CENTER" size="3" width="400" color="Black"></hr>
                      <div align="CENTER">
                        {[...pageLinks]}
                      </div>
                    </>
                  : makePageLink(1, 'See more...')
              }
            </div>
          )
        }
      }
    </Query>
  )
}

export default ProductList

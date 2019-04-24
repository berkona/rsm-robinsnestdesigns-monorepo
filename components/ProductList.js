import React from "react"
import { Query } from 'react-apollo'

import gql from 'graphql-tag'

import ProductTeaser from './ProductTeaser'
import Loader from './Loader'
import { SearchLink } from './Links'

export const pageQuery = gql`
query($id: Int, $searchPhrase: String, $skip: Int!, $limit: Int!) {
  allProducts(subcategoryId: $id, searchPhrase: $searchPhrase, skip: $skip, limit: $limit) {
    total,
    records {
      id
    }
  }
}
`

const ProductList = (props) => {
  const perPage = Number.parseInt(props.limit) || 50
  const page = Number.parseInt(props.page) || 1
  const variables = {
    id: Number.parseInt(props.subcategoryId),
    searchPhrase: props.searchPhrase,
    skip: (page -1) * perPage, limit: perPage
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
                subcategoryId={props.subcategoryId}
                pageNo={page}
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
              <h1>Search Results</h1>
              <div align="center"><b><SearchLink><a>Search Again</a></SearchLink></b></div>
              <hr align="CENTER" size="3" width="400" color="Black"></hr>
              <div align="center">
                <font face="Arial,Helvetica,sans-serif" size="2"><b>A total of <font color="Red">{data.allProducts.total}</font> records matched your search.</b></font>
              </div>
              <hr align="CENTER" size="3" width="400" color="Black"></hr>
              <div align="CENTER">
                {[...pageLinks]}
              </div>
              <table width="100%" cellSpacing="1">
                <tbody>
                  <tr>
                      <td align="left"><b><u><font size="+1">Item Information</font></u></b></td>
                      <td><div align="CENTER">Click on the Item Name for more detailed information.</div></td>
                      <td align="right"><b><u><font size="+1">Purchase Options</font></u></b></td>
                  </tr>
                </tbody>
              </table>
              {data.allProducts.records.map(r => <ProductTeaser id={r.id} />)}
            </div>
          )
        }
      }
    </Query>
  )
}

export default ProductList

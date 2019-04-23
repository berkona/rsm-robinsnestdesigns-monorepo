import React from "react"
import Link from 'next/link'
import { Query } from 'react-apollo'

import gql from 'graphql-tag'
import Loader from 'react-loaders'
import {SearchLink } from './Links'

export const pageQuery = gql`
query($categoryId: Int!) {
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

const SubcategoryGrid = (props) => (
  <Query query={pageQuery} variables={{ categoryId: Number.parseInt(props.categoryId) }}>
    {
      ({ loading, error, data }) => {
        if (loading) return <Loader type="ball-scale-ripple-multiple" />
        if (error) return <div>Error fetching data: {error.toString()}</div>
        return (
          <div id="category_results">
            <h1>Category: {data.category.title}</h1>
            <p dangerouslySetInnerHTML={{ __html: data.category.comments}}></p>
            <div className="instructions">Please choose a subcategory</div>
            <table border="0" cellSpacing="0" cellPadding="5" align="center">
            <tbody>
              {
                data.allSubcategories.map((category, index, arr) => {
                  var nEdges = arr.length;
                  var makeTD = (idx) => (
                    <td>
                      <table className="subcategory">
                        <tbody>
                          <tr>
                            <td>
                              <div className="subcategory">
                                <SearchLink subcategoryId={arr[idx].id} pageNo={1}>
                                    <a><span dangerouslySetInnerHTML={{__html: arr[idx].title}}></span></a>
                                </SearchLink>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  )
                  if (index % 3 !== 0) {
                    return null
                  } else  {
                    return (
                      <tr key={`subcategory-grid-${props.categoryId}-${arr[index].id}`}>
                        { makeTD(index) }
                        { index < nEdges - 1 ? makeTD(index+1) : <td></td> }
                        { index < nEdges - 2 ? makeTD(index+2) : <td></td> }
                      </tr>
                    )
                  }
                })
                .filter(x => x !== null)
              }
            </tbody>
            </table>
          </div>
        )
      }
    }
  </Query>
)

export default SubcategoryGrid

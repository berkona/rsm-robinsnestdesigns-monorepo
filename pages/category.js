import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import Loader from '../components/Loader'
import SubcategoryGrid from '../components/SubcategoryGrid'
import {SearchLink } from '../components/Links'

import { withRouter } from 'next/router'

export const pageQuery = gql`
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

const Category = withRouter((props) => (
  <Query query={pageQuery} variables={{ categoryId: Number.parseInt(props.router.query.categoryId) }}>
    {
      ({ loading, error, data }) => {
        if (loading) return <Loader />
        if (error) return <div>Error fetching data: {error.toString()}</div>
        return (
          <div id="category_results">
            <h1>Category: {data.category.title}</h1>
            <p dangerouslySetInnerHTML={{ __html: data.category.comments}}></p>
            <div className="instructions">Please choose a subcategory</div>
            <SubcategoryGrid categories={data.allSubcategories}>
              {
                (item) => (
                  <SearchLink categoryId={props.router.query.categoryId} subcategoryId={item.id} pageNo={1}>
                    <a><span dangerouslySetInnerHTML={{__html: item.title}}></span></a>
                  </SearchLink>
                )
              }
            </SubcategoryGrid>
          </div>
        )
      }
    }
  </Query>
))

export default Category

import React from 'react'
import { Query } from 'react-apollo'
import { withRouter } from 'next/router'
import { SearchLink } from '../components/Links'
import GridList from '../components/GridList'
import ContentWithSidebar from '../components/ContentWithSidebar'
import { SUBCATEGORY_GET_ONE } from '../constants/queries'
import CategoryTeaser from '../components/CategoryTeaser'
import Loader from '../components/Loader'
import Breadcrumb from '../components/Breadcrumb'
import gql from 'graphql-tag'

const CATEGORY_GET = gql`
query {
  category(categoryId: $categoryId) {
    id
    title
  }
}
`
export default withRouter(({ router }) => <ContentWithSidebar>
<Breadcrumb>
  <Breadcrumb.Item href={"/categories"}>All categories</Breadcrumb.Item>
  <Breadcrumb.Item href={"/categories/" + router.query.categoryId} active>
    <Query query={CATEGORY_GET} variables={{ categoryId: router.query.categoryId }}>
      {({ loading, error, data }) => data && data.category && data.category.title}
    </Query>
  </Breadcrumb.Item>
</Breadcrumb>
<Query query={SUBCATEGORY_GET_ONE} variables={{ categoryId: router.query.categoryId }}>
  {({ loading, error, data }) => (
    !data || !data.allSubcategories || !data.allSubcategories.length ? <Loader /> :
    <GridList items={data.allSubcategories}>
      {c => <CategoryTeaser category={c}>
          <SearchLink categoryId={router.query.categoryId}
                          subcategoryId={c.id}
                          sortOrder="mostRecent">
            <a>Browse items</a>
          </SearchLink>
        </CategoryTeaser>
      }
    </GridList>
  )
  }
</Query>
</ContentWithSidebar>)

import React from 'react'
import { Query } from 'react-apollo'
import { CategoryLink } from '../components/Links'
import GridList from '../components/GridList'
import ContentWithSidebar from '../components/ContentWithSidebar'
import CategoryTeaser from '../components/CategoryTeaser'
import gql from 'graphql-tag'

const CATEGORY_GET = gql`
query {
  allProducts {
    categories {
      id
      title
      comments
      image
    }
  }
}
`

export default () => <ContentWithSidebar>
<Query query={CATEGORY_GET}>
  {({ loading, error, data }) => !data ? <p>No data</p> :
  <GridList items={data.allProducts.categories}>
    {c => <CategoryTeaser category={c}>
        <CategoryLink categoryId={c.id}>
          <a>Browse subcategories</a>
        </CategoryLink>
    </CategoryTeaser>}
  </GridList>
  }
</Query>
</ContentWithSidebar>

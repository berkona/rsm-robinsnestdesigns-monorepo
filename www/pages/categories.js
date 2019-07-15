import React from 'react'
import { Query } from 'react-apollo'
import { CategoryLink } from '../components/Links'
import GridList from '../components/GridList'
import ContentWithSidebar from '../components/ContentWithSidebar'
import CategoryTeaser from '../components/CategoryTeaser'
import gql from 'graphql-tag'
import Breadcrumb from 'react-bootstrap/Breadcrumb'
import Button from 'react-bootstrap/Button'
import SEO from '../components/SEO'
import Loader from '../components/Loader'
import ApolloError from '../components/ApolloError'

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
  <SEO title="Browse All Categories" description="Browse all the categories at Robin's Nest Designs" />
  <div className="clearfix" style={{ marginTop: '10px' }}>
    <div className="float-left">
      <Breadcrumb>
        <Breadcrumb.Item href={"/categories"} active={true}>All categories</Breadcrumb.Item>
      </Breadcrumb>
    </div>
  </div>

  <Query query={CATEGORY_GET}>
    {({ loading, error, data }) => loading ? <Loader />
      : error ? <ApolloError error={error} />
      : !data || !data.allProducts || !data.allProducts.categories ? <p>No data</p>
      : <GridList items={data.allProducts.categories}>
      {c => <CategoryTeaser key={c.id} category={c}>
          <CategoryLink categoryId={c.id}>
            <Button style={{ marginTop: '8px' }}><a>Browse subcategories</a></Button>
          </CategoryLink>
      </CategoryTeaser>}
    </GridList>
    }
  </Query>
</ContentWithSidebar>

import React from 'react'
import { Query } from 'react-apollo'
import { withRouter } from 'next/router'
import { SearchLink } from '../components/Links'
import GridList from '../components/GridList'
import ContentWithSidebar from '../components/ContentWithSidebar'
import CategoryTeaser from '../components/CategoryTeaser'
import Loader from '../components/Loader'
import Breadcrumb from 'react-bootstrap/Breadcrumb'
import gql from 'graphql-tag'
import Button from 'react-bootstrap/Button'
import SEO from '../components/SEO'
import ApolloError from '../components/ApolloError'

const CATEGORY_GET = gql`
query($categoryId: ID!) {
  category(categoryId: $categoryId) {
    id
    title
    comments
  }
}
`

const SUBCATEGORY_GET_ONE = gql`
query($categoryId: ID!) {
  allProducts(categoryId: $categoryId) {
    subcategories {
      id
      title
      comments
      image
    }
  }
}
`

export default withRouter(({ router }) => <ContentWithSidebar>
  <Query query={CATEGORY_GET} variables={{ categoryId: router.query.categoryId }}>
    {({ loading, error, data }) => loading ? <Loader />
      : error ? <ApolloError error={error} />
      : (!data || !data.category) ? <></>
      : <>
        <SEO title={"Browse " + data.category.title} description={"Browse all the subcategories of " + data.category.title + " at Robin's Nest Designs"} />
        <div className="clearfix" style={{ marginTop: '10px' }}>
          <div className="float-left">
          <Breadcrumb>
            <Breadcrumb.Item href={"/categories"}>All categories</Breadcrumb.Item>
            <Breadcrumb.Item href={"/categories/" + router.query.categoryId} active>
              {data.category.title}
            </Breadcrumb.Item>
          </Breadcrumb>
          </div>
        </div>
        { data.category.comments && <p dangerouslySetInnerHTML={{ __html: data.category.comments }}></p> }
        <SearchLink categoryId={router.query.categoryId}
                    sortOrder="mostRecent">
          <Button variant="primary">
            View all items in category
          </Button>
        </SearchLink>

        <hr />
      </>
    }
  </Query>
  <Query query={SUBCATEGORY_GET_ONE} variables={{ categoryId: router.query.categoryId }}>
    {({ loading, error, data }) => (
      !data || !data.allProducts || !data.allProducts.subcategories ? <Loader /> :
      <GridList items={data.allProducts.subcategories}>
        {c => <CategoryTeaser key={c.id} category={c}>
            <SearchLink categoryId={router.query.categoryId}
                            subcategoryId={c.id}
                            sortOrder="mostRecent">
              <Button style={{ marginTop: '8px' }}><a>Browse items</a></Button>
            </SearchLink>
          </CategoryTeaser>
        }
      </GridList>
    )
    }
  </Query>
</ContentWithSidebar>)

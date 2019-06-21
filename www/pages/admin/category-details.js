import React from 'react'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import { withRouter } from 'next/router'
import ModifyCategoryForm from '../../components/ModifyCategoryForm'
import { Query, Mutation } from 'react-apollo'
import { CATEGORY_GET } from '../../constants/queries'
import Loader from '../../components/Loader'
import ApolloError from '../../components/ApolloError'
import gql from 'graphql-tag'
import { CurrentUserContext } from '../../lib/auth'
import Router from 'next/router'
import Button from 'react-bootstrap/Button'
import Link from 'next/link'

const UPDATE_CATEGORY = gql`
mutation($token: String!, $categoryId: ID!, $category: CategoryInput!) {
  updateCategory(token: $token, categoryId: $categoryId, category: $category) {
    id
  }
}
`
export default withRouter((props) => <Col><div style={{ padding: '24px'}}>
  <h1>Modify Category</h1>
  <hr />
  <Query query={CATEGORY_GET}>
    {({ loading, error, data }) => {
      if (loading) return <Loader />
      if (error) return <ApolloError error={error} />
      const { allCategories } = data
      if (!allCategories) return <p>No data</p>
      const category = allCategories.filter(c => c.id == props.router.query.categoryId)[0]
      if (!category) return<p>Category does not exist</p>
      return <CurrentUserContext.Consumer>
        {currentUser => <>
          <Mutation mutation={UPDATE_CATEGORY} variables={{ token: currentUser.getToken(), categoryId: props.router.query.categoryId  }} refetchQueries={[{ query: CATEGORY_GET }]}>
            {(mutationFn, {loading, error, data }) => {
              let errorObj = <></>
              if (error) {
                errorObj = <ApolloError error={error} />
              }
              return <>
              {errorObj}
              <ModifyCategoryForm
                category={category}
                onSubmit={newCategory => {
                  mutationFn({ variables: { category: newCategory, } }).then(() => Router.push('/admin/categories'))
                }}
              /></>
            }}
          </Mutation>
        </>}
      </CurrentUserContext.Consumer>
    }}
  </Query>
</div></Col>)

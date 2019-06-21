import React from 'react'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import { withRouter } from 'next/router'
import ModifyCategoryForm from '../../components/ModifyCategoryForm'
import { Mutation } from 'react-apollo'
import { CATEGORY_GET } from '../../constants/queries'
import ApolloError from '../../components/ApolloError'
import gql from 'graphql-tag'
import { CurrentUserContext } from '../../lib/auth'
import Router from 'next/router'

const INSERT_CATEGORY = gql`
mutation($token: String!, $category: CategoryInput!) {
  addCategory(token: $token, category: $category) {
    id
  }
}
`
export default withRouter((props) => <Col><div style={{ padding: '24px'}}>
  <h1>Add Category</h1>
  <hr />
  <CurrentUserContext.Consumer>
    {currentUser => <>
      <Mutation mutation={INSERT_CATEGORY} variables={{ token: currentUser.getToken()  }} refetchQueries={[{ query: CATEGORY_GET }]}>
        {(mutationFn, {loading, error, data }) => {
          let errorObj = <></>
          if (error) {
            errorObj = <ApolloError error={error} />
          }
          return <>
          {errorObj}
          <ModifyCategoryForm
            saveLabel="Add Category"
            onSubmit={newCategory => {
              mutationFn({ variables: { category: newCategory, } }).then(() => Router.push('/admin/categories'))
            }}
          /></>
        }}
      </Mutation>
    </>}
  </CurrentUserContext.Consumer>
</div></Col>)

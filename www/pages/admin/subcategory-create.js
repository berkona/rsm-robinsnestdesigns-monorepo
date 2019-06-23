import React from 'react'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import { withRouter } from 'next/router'
import ModifyCategoryForm from '../../components/ModifyCategoryForm'
import { Mutation } from 'react-apollo'
import {  SUBCATEGORY_GET_ONE } from '../../constants/queries'
import ApolloError from '../../components/ApolloError'
import gql from 'graphql-tag'
import { CurrentUserContext } from '../../lib/auth'
import Router from 'next/router'

const INSERT_SUBCATEGORY = gql`
mutation($token: String!, $subcategory: SubCategoryInput!) {
  addSubcategory(token: $token, subcategory: $subcategory) {
    id
  }
}
`
export default withRouter((props) => <Col><div style={{ padding: '24px'}}>
  <h1>Add Subcategory</h1>
  <hr />
  <CurrentUserContext.Consumer>
    {currentUser => <>
      <Mutation mutation={INSERT_SUBCATEGORY} variables={{ token: currentUser.getToken()  }} refetchQueries={[{ query: SUBCATEGORY_GET_ONE }, { query: SUBCATEGORY_GET_ONE, variables: { categoryId: props.router.query.categoryId }}]}>
        {(mutationFn, {loading, error, data }) => {
          let errorObj = <></>
          if (error) {
            errorObj = <ApolloError error={error} />
          }
          return <>
          {errorObj}
          <ModifyCategoryForm
            saveLabel="Add Subcategory"
            onSubmit={newCategory => {
              mutationFn({ variables: { subcategory:  Object.assign({}, newCategory, { categoryId: props.router.query.categoryId }) } })
                .then(() => Router.push('/admin/category-details?categoryId=' + props.router.query.categoryId))
            }}
          /></>
        }}
      </Mutation>
    </>}
  </CurrentUserContext.Consumer>
</div></Col>)

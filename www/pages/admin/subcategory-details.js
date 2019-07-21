import React from 'react'
import Table from 'react-bootstrap/Table'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import { withRouter } from 'next/router'
import ModifyCategoryForm from '../../components/ModifyCategoryForm'
import { Query, Mutation } from 'react-apollo'
import { CATEGORY_GET, SUBCATEGORY_GET_ONE } from '../../constants/queries'
import Loader from '../../components/Loader'
import ApolloError from '../../components/ApolloError'
import gql from 'graphql-tag'
import { CurrentUserContext } from '../../lib/auth'
import Router from 'next/router'
import Button from 'react-bootstrap/Button'
import Link from 'next/link'

const UPDATE_SUBCATEGORY = gql`
mutation($token: String!, $subcategoryId: ID!, $subcategory: SubCategoryInput!) {
  updateSubcategory(token: $token, subcategoryId: $subcategoryId, subcategory: $subcategory) {
    id
  }
}
`

const REMOVE_SUBCATEGORY = gql`
mutation($token: String!, $subcategoryId: ID!) {
  removeSubcategory(token: $token, subcategoryId: $subcategoryId)
}
`

export default withRouter((props) => <Col><div style={{ padding: '24px'}}>
  <h1>Modify Subcategory</h1>
  <hr />
  <Query query={SUBCATEGORY_GET_ONE} variables={{ categoryId: props.router.query.categoryId }}>
    {({ loading, error, data }) => {
      if (loading) return <Loader />
      if (error) return <ApolloError error={error} />
      const backToCategory = () => Router.push('/admin/category-details?categoryId=' + props.router.query.categoryId)
      const { allSubcategories } = data
      if (!allSubcategories) return <p>No data</p>
      const category = allSubcategories.filter(c => c.id == props.router.query.subcategoryId)[0]
      if (!category) return<p>Category does not exist</p>
      return <CurrentUserContext.Consumer>
        {currentUser => <>
          <Mutation mutation={UPDATE_SUBCATEGORY} variables={{ token: currentUser.getToken(), subcategoryId: props.router.query.subcategoryId  }} refetchQueries={[{ query: SUBCATEGORY_GET_ONE }, { query: SUBCATEGORY_GET_ONE, variables: { categoryId: props.router.query.categoryId }}]}>
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
                  mutationFn({ variables: { subcategory: Object.assign({}, newCategory, { categoryId: props.router.query.categoryId }) } })
                    .then(backToCategory)
                }}
              /></>
            }}
          </Mutation>
          <Mutation mutation={REMOVE_SUBCATEGORY} variables={{ token: currentUser.getToken(), subcategoryId: props.router.query.subcategoryId  }}>
            {(mutationFn, { loading, error, data }) => {
              return <div style={{ marginTop: '48px' }}><Button variant="danger" onClick={() => mutationFn().then(backToCategory)}>Remove Subcategory</Button></div>
            }}
          </Mutation>
        </>}
      </CurrentUserContext.Consumer>
    }}
  </Query>
</div></Col>)

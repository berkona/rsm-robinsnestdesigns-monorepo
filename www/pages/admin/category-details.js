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

  <h1>Subcategories</h1>
  <hr />
  <Query query={SUBCATEGORY_GET_ONE} variables={{ categoryId: props.router.query.categoryId }}>
    {({ loading, error, data }) => {
      if (loading) return <Loader />
      if (error) return <ApolloError error={error} />
      const allSubcategories = (data && data.allSubcategories) || []
      return <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
          </tr>
        </thead>
        <tbody>
          {allSubcategories.map(category => <tr>
            <td>
              <Link href={"/admin/subcategory-details?categoryId=" + props.router.query.categoryId + "&subcategoryId=" + category.id}>
                <a>{category.id}</a>
              </Link>
            </td>
            <td>{category.title}</td>
          </tr>
          )}
        </tbody>
      </Table>
    }}
  </Query>
  <hr />
  <Button variant="outline-dark">
    <Link href={"/admin/subcategory-create?categoryId=" + props.router.query.categoryId }>
      <a>Add Subcategory</a>
    </Link>
  </Button>
</div></Col>)

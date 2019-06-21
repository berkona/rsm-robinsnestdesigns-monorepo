import React from 'react'
import AdminSearchComponent from '../../components/AdminSearchComponent'
import gql from 'graphql-tag'
import Link from 'next/link'
import ApolloError from '../../components/ApolloError'
import Loader from '../../components/Loader'
import Table from 'react-bootstrap/Table'
import Col from 'react-bootstrap/Col'
import { Query } from 'react-apollo'
import { CATEGORY_GET } from '../../constants/queries'

export default (props) => (
  <Col><div style={{ padding: '24px' }}>
  <h1>Search Categories</h1>
  <hr />
  <Query query={CATEGORY_GET}>
    {({ loading, error, data }) => {
      if (loading) return <Loader />
      if (error) return <ApolloError error={error} />
      if (!data || !data.allCategories) return <p>No data returned</p>
      return <AdminSearchComponent>
        {(searchPhrase) => {
          let categories = data.allCategories
          if (searchPhrase) {
            categories = categories.filter(c => c.title.toLowerCase().includes(searchPhrase.toLowerCase()))
          }
          return <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => <tr>
                <th><Link href={'/admin/category-details/' + category.id}><a>{category.id}</a></Link></th>
                <th>{category.title}</th>
              </tr>)}
            </tbody>
          </Table>
        }}
      </AdminSearchComponent>
    }}
  </Query>
  </div></Col>
)

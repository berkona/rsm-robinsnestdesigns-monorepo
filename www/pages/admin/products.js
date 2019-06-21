import React from 'react'
import AdminSearchComponent from '../../components/AdminSearchComponent'
import gql from 'graphql-tag'
import Link from 'next/link'
import ApolloError from '../../components/ApolloError'
import Loader from '../../components/Loader'
import Table from 'react-bootstrap/Table'
import Col from 'react-bootstrap/Col'
import { Query } from 'react-apollo'

const SEARCH_PRODUCTS = gql`
query($searchPhrase: String!) {
  allProducts(searchPhrase: $searchPhrase) {
    records {
      id
      sku
      name
      category
      subcategory
    }
  }
}
`

export default () => (
  <Col><div style={{ padding: '24px' }}>
    <h1>Search products</h1>
    <hr />
    <AdminSearchComponent>
      {(searchPhrase) => <>{searchPhrase ? <Query query={SEARCH_PRODUCTS} variables={{ searchPhrase }}>
        {({ loading, error, data }) => {
          if (loading) return <Loader />
          if (error) return <ApolloError error={error} />
          return <Table striped bordered hover>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Subcategory</th>
              </tr>
            </thead>
            <tbody>
              {data.allProducts.records.map((product) => <tr>
                <th><Link href={'/admin/product-details/' + product.id}><a>{product.sku}</a></Link></th>
                <th>{product.name}</th>
                <th>{product.category}</th>
                <th>{product.subcategory}</th>
              </tr>)}
            </tbody>
          </Table>
        }}
      </Query> : <></>}</>}
    </AdminSearchComponent>
  </div></Col>
)

import React, { useContext } from 'react'
import AdminSearchComponent from '../../components/AdminSearchComponent'
import gql from 'graphql-tag'
import Link from 'next/link'
import ApolloError from '../../components/ApolloError'
import Loader from '../../components/Loader'
import Table from 'react-bootstrap/Table'
import Col from 'react-bootstrap/Col'
import { Query } from 'react-apollo'
import { CurrentUserContext } from '../../lib/auth'

const PROMOS_GET = gql`
query($token: String!) {
  allPromos(token: $token) {
    id
    coupon
    starts
    ends
    requiresTotal
    requiresSubcategory
    percentageOff
    moneyOff
    freeShipping
  }
}
`

export default (props) => {
  const currentUser = useContext(CurrentUserContext)
  return <Col><div style={{ padding: '24px' }}>
  <h1>Search Promos</h1>
  <hr />
  <Query query={PROMOS_GET} variables={{ token: currentUser.getToken() }}>
    {({ loading, error, data }) => {
      if (loading) return <Loader />
      if (error) return <ApolloError error={error} />
      if (!data || !data.allPromos) return <p>No data returned</p>
      return <AdminSearchComponent>
        {(searchPhrase) => {
          let promos = data.allPromos
          if (searchPhrase) {
            promos = promos.filter(c => c.coupon.toLowerCase().includes(searchPhrase.toLowerCase()))
          }
          return <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Coupon</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => <tr>
                <th><Link href={'/admin/promo-details?promoId=' + promo.id}><a>{promo.id}</a></Link></th>
                <th>{promo.coupon}</th>
              </tr>)}
            </tbody>
          </Table>
        }}
      </AdminSearchComponent>
    }}
  </Query>
  </div></Col>
}

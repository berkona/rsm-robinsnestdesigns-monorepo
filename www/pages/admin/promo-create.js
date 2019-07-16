import React from 'react'
import Col from 'react-bootstrap/Col'
import { withRouter } from 'next/router'
import ModifyPromoForm from './ModifyPromoForm'
import { Mutation } from 'react-apollo'
import ApolloError from '../../components/ApolloError'
import gql from 'graphql-tag'
import { CurrentUserContext } from '../../lib/auth'
import Router from 'next/router'

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

const UPDATE_PROMO = gql`
mutation($token: String!, $promo: PromoInput!) {
  addPromo(token: $token, promo: $promo) {
    id
  }
}
`

export default withRouter((props) => <Col>
  <div style={{ padding: '24px'}}>
    <h1>Add Promo</h1>
    <hr />
    <CurrentUserContext.Consumer>
      {
        currentUser => <>
          <Mutation mutation={UPDATE_PROMO} variables={{ token: currentUser.getToken() }} refetchQueries={[{ query: PROMOS_GET }]}>
            {(mutationFn, {loading, error, data }) => {
              let errorObj = <></>
              if (error) {
                errorObj = <ApolloError error={error} />
              }
              return <>
              {errorObj}
              <ModifyPromoForm
                onSubmit={newPromo => {
                  mutationFn({ variables: { promo: newPromo, } }).then(() => Router.push('/admin/promos'))
                }}
              /></>
            }}
          </Mutation>
        </>
      }
    </CurrentUserContext.Consumer>
  </div>
</Col>)

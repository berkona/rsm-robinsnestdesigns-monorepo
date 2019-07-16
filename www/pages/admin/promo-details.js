import React from 'react'
import Col from 'react-bootstrap/Col'
import { withRouter } from 'next/router'
import ModifyPromoForm from './ModifyPromoForm'
import { Query, Mutation } from 'react-apollo'
import Loader from '../../components/Loader'
import ApolloError from '../../components/ApolloError'
import gql from 'graphql-tag'
import { CurrentUserContext } from '../../lib/auth'
import Router from 'next/router'
import Button from 'react-bootstrap/Button'

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
mutation($token: String!, $promoId: ID!, $promo: PromoInput!) {
  updatePromo(token: $token, promoId: $promoId, promo: $promo) {
    id
  }
}
`

const DELETE_PROMO = gql`
mutation($token: String!, $promoId: ID!) {
  removePromo(token: $token, promoId: $promoId)
}
`

export default withRouter((props) => <Col><div style={{ padding: '24px'}}>
  <h1>Modify Promo</h1>
  <hr />
  <CurrentUserContext.Consumer>
    {currentUser => <>
      <Query query={PROMOS_GET} variables={{ token: currentUser.getToken() }}>
        {({ loading, error, data }) => {
          if (loading) return <Loader />
          if (error) return <ApolloError error={error} />
          const { allPromos } = data
          if (!allPromos) return <p>No data</p>
          const promo = allPromos.filter(c => c.id == props.router.query.promoId)[0]
          if (!promo) return<p>Promo does not exist</p>
          return <Mutation mutation={UPDATE_PROMO} variables={{ token: currentUser.getToken(), promoId: props.router.query.promoId  }} refetchQueries={[{ query: PROMOS_GET }]}>
                {(mutationFn, {loading, error, data }) => {
                  let errorObj = <></>
                  if (error) {
                    errorObj = <ApolloError error={error} />
                  }
                  return <>
                  {errorObj}
                  <ModifyPromoForm
                    promo={promo}
                    onSubmit={newPromo => {
                      mutationFn({ variables: { promo: newPromo, } }).then(() => Router.push('/admin/promos'))
                    }}
                  /></>
                }}
              </Mutation>
        }}
      </Query>
      <Mutation mutation={DELETE_PROMO} variables={{ token: currentUser.getToken(), promoId: props.router.query.promoId  }}>
        {(mutationFn, { loaing, error, data }) => {
          return <div style={{ marginTop: '48px' }}><Button variant="danger" onClick={() => mutationFn().then(() => Router.push('/admin/promos'))}>Delete Promo</Button></div>
        }}
      </Mutation>
    </>
  }
  </CurrentUserContext.Consumer>
</div></Col>)

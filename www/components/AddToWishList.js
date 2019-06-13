import React from 'react'
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import { FaSpinner, FaHeartBroken, FaHeart } from 'react-icons/fa'
import { CurrentUserContext } from '../lib/auth'
import Button from 'react-bootstrap/Button'
import ApolloError from './ApolloError'

const WISHLIST_QUERY = gql`
query($token: String!, $productId: ID!) {
  isInWishlist(token: $token, productId: $productId)
}
`

const ADD_TO_WISHLIST = gql`
mutation($token: String!, $productId: ID!) {
  addToWishList(token: $token, productId: $productId)
}
`

const REMOVE_FROM_WISHLIST = gql`
mutation($token: String!, $productId: ID!) {
  removeFromWishList(token: $token, productId: $productId)
}
`

class AddToWishList extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <CurrentUserContext.Consumer>
    { currentUser => {
      if (!currentUser.isLoggedIn()) {
        return <></>
      }
      const wlVars = { token: currentUser.getToken(), productId: this.props.productId }
      return <Query query={WISHLIST_QUERY} variables={wlVars}>
        {({ loading, error, data }) => {
          const queryLoading = loading
          const queryError = error
          if (data && data.isInWishlist) {
            return <Mutation mutation={REMOVE_FROM_WISHLIST}
                             variables={{
                               token: currentUser.getToken(),
                               productId: this.props.productId
                             }}
                             refetchQueries={[{ query: WISHLIST_QUERY, variables: wlVars }]}>
              {(mutationFn, { loading, error, data }) => {
                return <Button variant="light" onClick={mutationFn} block disabled={queryError || loading}>
                { loading ? <><FaSpinner /> Working...</> : (
                  error
                    ? <ApolloError error={error} />
                    : <><FaHeartBroken /> Remove from Wish List</>
                )}
                </Button>
              }}
            </Mutation>
          } else {
            return <Mutation mutation={ADD_TO_WISHLIST}
                             variables={{
                               token: currentUser.getToken(),
                               productId: this.props.productId
                             }}
                             refetchQueries={[{ query: WISHLIST_QUERY, variables: wlVars }]}>
              {(mutationFn, { loading, error, data }) => {
                return <Button variant="dark" onClick={mutationFn} block disabled={queryLoading || queryError || loading}>
                  { loading ? <><FaSpinner /> Working...</> : (
                    error
                      ? <ApolloError error={error} />
                      : <><FaHeart /> Add to Wish List</>
                  )}
                </Button>
              }}
            </Mutation>
          }
        }}
      </Query>
    } }
    </CurrentUserContext.Consumer>
  }
}

export default AddToWishList

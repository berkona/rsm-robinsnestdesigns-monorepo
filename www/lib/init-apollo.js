import { toIdValue } from 'apollo-utilities';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { BatchHttpLink } from "apollo-link-batch-http";
import { RetryLink } from "apollo-link-retry";
import { ApolloLink } from 'apollo-link';
import { API_URL } from '../constants/config'
import { WISHLIST_QUERY_ALL } from '../constants/queries'
import fetch from 'isomorphic-unfetch'
import gql from 'graphql-tag'

const typeDefs = gql`
  extend type Query {
    isInWishlist(token: String!, productId: ID!): Boolean
  }
`

let apolloClient = null

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch
}

const defaultValidHostRegex = /^[a-zA-Z0-9_\/\-\.]+.now\.sh$/

function create (initialState, req) {
  const cache = new InMemoryCache({
    cacheRedirects: {
      Query: {
        product: (_, args) => toIdValue(cache.config.dataIdFromObject({ __typename: 'Product', id: args.productId })),
        category: (_, args) => toIdValue(cache.config.dataIdFromObject({ __typename: 'Category', id: args.categoryId }))
      }
    }
  }).restore(initialState || {});
  const httpLink = new BatchHttpLink({
    uri: API_URL
  })
  const retryLink = new RetryLink({
    delay: {
      initial: 300,
      max: Infinity,
      jitter: true
    },
    attempts: {
      max: 10,
      retryIf: (error, _operation) => !!error
    }
  })
  const client = new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    link: ApolloLink.from([
      retryLink,
      httpLink,
    ]),
    cache,
    typeDefs,
    resolvers: {
      Query: {
        isInWishlist: async (_, { token, productId }, { client }) => {
          const { data } = await client.query({ query: WISHLIST_QUERY_ALL, variables: { token } })
          const { wishlist } = data
          return wishlist.some(item => item && item.product && item.product.id == productId)
        }
      }
    }
  })
  return client
}

export default function initApollo (initialState, req) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return create(initialState, req)
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState, req)
  }

  return apolloClient
}

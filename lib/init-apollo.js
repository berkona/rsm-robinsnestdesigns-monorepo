import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createHttpLink } from 'apollo-link-http';

import fetch from 'isomorphic-unfetch'

let apolloClient = null

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch
}

import gql from 'graphql-tag';

const typeDefs = gql`
  extend type Query {
    cartItems: [CartItem!]!
  }

  extend type Product {
    isInCart: Boolean!
  }

  extend type Mutation {
    changeCart(cartItem: CartItem!): [CartItem!]!
  }

  type CartItem {
    product: Product!,
    qty: Int!,
  }
`;

function create (initialState) {
  // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
  const cache = new InMemoryCache().restore(initialState || {});
  const client = new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    link: createHttpLink({
      uri: 'https://t0ia86s7y6.execute-api.us-east-1.amazonaws.com/dev/graphql'
    }),
    cache,
    typeDefs,
    resolvers: {
      Product: {
        isInCart: (_, { productId }, { cache }) => {
          const query = gql`
            query {
              cartItems @client {
                product {
                  id
                }
              }
            }
          `
          const cart = cache.readQuery({ query })
          return cart.cartItems.some((x) => x.product.id == id)
        }
      },
      Mutation: {
        updateCartItem: (_, { id, qty }, { cache }) => {
          const query = gql`
            query {
              cartItems @client {
                product {
                  id
                }
                qty
              }
            }
          `

          const previous = cache.readQuery({ query })
          const isUpdate = previous.cartItems.some((x) => x.product.id == id)
          const isDelete = qty <= 0

          let cartItems = []
          if (isDelete) {
              cartItems = previous.cartItems.filter((x) => x.id != id)
          } else {
            if (isUpdate) {
              cartItems = previous.cartItems.map((x) => x.id == id ? { id, qty } : x)
            } else {
              cartItems = [...previous.cartItems, { id, qty }]
            }
          }
          const data = {
            cartItems,
          }
          cache.writeQuery({ query, data })
          return cartItems
        },
      }
    },
  })
  return client
}

export default function initApollo (initialState) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return create(initialState)
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState)
  }

  return apolloClient
}

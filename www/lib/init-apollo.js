import url from 'url'
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { BatchHttpLink } from "apollo-link-batch-http";

import fetch from 'isomorphic-unfetch'

let apolloClient = null

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch
}

const defaultValidHostRegex = /^[a-zA-Z0-9_\/\-\.]+.now\.sh$/

function getAPIUrl(req) {
  return process.browser ? '/graphql' : process.env.API_URL || 'http://localhost:3000/graphql'
}

function create (initialState, req) {
  // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
  const cache = new InMemoryCache().restore(initialState || {});
  const httpLink = new BatchHttpLink({
    uri: getAPIUrl(req)
  })
  const client = new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    link: httpLink,
    cache,
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

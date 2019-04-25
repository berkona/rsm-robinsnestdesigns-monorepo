import App, { Container } from 'next/app'
import React from 'react'
import withApolloClient from '../lib/with-apollo-client'
import { ApolloProvider } from 'react-apollo'
import Layout from '../components/Layout'
import NProgress from 'nprogress'
import Router from 'next/router'
import withGA from "next-ga"

NProgress.configure({
  showSpinner: false,
  parent: '#content',
  trickleSpeed: 200,
});

// setup client-side page-wide loading bar
Router.events.on('routeChangeStart', url => {
    NProgress.start()
})

Router.events.on('routeChangeComplete', () => NProgress.done())

Router.events.on('routeChangeError', () => NProgress.done())

class MyApp extends App {
  render () {
    const { Component, pageProps, apolloClient } = this.props
    return (
      <Container>
        <ApolloProvider client={apolloClient}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ApolloProvider>
      </Container>
    )
  }
}

export default withGA("UA-4561227-5", Router)(withApolloClient(MyApp))

import App, { Container } from 'next/app'
import React from 'react'
import withApolloClient from '../lib/with-apollo-client'
import { ApolloProvider } from 'react-apollo'
import Layout from '../components/Layout'
import NProgress from 'nprogress'
import Router from 'next/router'
import withGA from "next-ga"
import Cookies from 'nookies'
import { CurrentUserProvider } from '../lib/auth'

const USER_TOKEN = 'USER_TOKEN'
const USER_CART = 'CUSTOMERID'

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
});

// setup client-side page-wide loading bar
Router.events.on('routeChangeStart', url => {
    NProgress.start()
})

Router.events.on('routeChangeComplete', () => NProgress.done())

Router.events.on('routeChangeError', () => NProgress.done())

class MyApp extends App {
  static async getInitialProps({ ctx }) {
    return {
      cookies: Cookies.get(ctx)
    }
  }

  constructor(props) {
    super(props)
    const { cookies } = this.props
    this.state = {
      currentUserToken: cookies && cookies[USER_TOKEN],
      currentUserCartId: cookies && cookies[USER_CART],
    }
  }

  componentDidMount() {
    const { cookies } = this.props
    this.setState({
      currentUserToken: cookies && cookies[USER_TOKEN],
      currentUserCartId: cookies && cookies[USER_CART],
    })
  }

  render () {
    const { Component, pageProps, apolloClient } = this.props
    let token = this.state.currentUserToken
    let cartId = this.state.currentUserCartId
    const CurrentUser = {
      login: (newToken) => {
        Cookies.set(null, USER_TOKEN, newToken, {
          maxAge:  30 * 24 * 60 * 60,
          path: '/',
        })
        this.setState({
          currentUserToken: newToken
        })
      },
      isLoggedIn: () => {
        return !!token
      },
      getToken: () => {
        return token
      },
      logout: () => {
        Cookies.destroy(null, USER_TOKEN, {
          path: '/',
        })
        Cookies.destroy(null, USER_CART, {
          path: '/',
        })
        this.setState({
          currentUserToken: null,
          currentUserCartId: null,
        })
      },
      getCartId: () => {
        return cartId
      },
      setCartId: (newCartId) => {
        Cookies.set(null, USER_CART, newCartId, {
          maxAge:  30 * 24 * 60 * 60,
          path: '/',
        })
        this.setState({
          currentUserCartId: newCartId,
        })
      },
      deleteCartId: () => {
        Cookies.destroy(null, USER_CART, {
          path: '/',
        })
        this.setState({
          currentUserCartId: null,
        })
      },
    }
    return (
      <Container>
        <ApolloProvider client={apolloClient}>
          <CurrentUserProvider value={CurrentUser}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </CurrentUserProvider>
        </ApolloProvider>
      </Container>
    )
  }
}

export default withGA("UA-4561227-5", Router)(withApolloClient(MyApp))
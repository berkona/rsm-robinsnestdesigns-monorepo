import App, { Container } from 'next/app'
import React from 'react'
import withApolloClient from '../lib/with-apollo-client'
import { ApolloProvider } from 'react-apollo'
import Layout from '../components/Layout'
import NProgress from 'nprogress'
import Router from 'next/router'
import Cookies from 'nookies'
import { CurrentUserProvider } from '../lib/auth'
// import { initGA } from '../lib/react-ga'
import { initGA, PageView } from '../lib/next-ga-ec'
const USER_TOKEN = 'USER_TOKEN'
const USER_CART = 'CUSTOMERID'
import { hotjar } from 'react-hotjar';

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
  static async getInitialProps(args) {
    let { Component, ctx } = args
    let _innerProps = {}
    if (Component.getInitialProps) {
      _innerProps = await Component.getInitialProps(args)
    }
    return {
      cookies: Cookies.get(ctx),
      _innerProps: _innerProps
    }
  }

  constructor(props) {
    super(props)
    const { cookies } = this.props
    this.state = {
      currentUserToken: cookies && cookies[USER_TOKEN],
      currentUserCartId: cookies && cookies[USER_CART],
    }
    initGA("UA-4561227-5")
    if (process.browser) {
      hotjar.initialize(1409743, 6)
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
    const { Component, _innerProps, pageProps, apolloClient } = this.props
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
            <PageView>
              <Layout>
                <Component {...pageProps} {..._innerProps} />
              </Layout>
            </PageView>
          </CurrentUserProvider>
        </ApolloProvider>
      </Container>
    )
  }
}

export default withApolloClient(MyApp)

import React from 'react'
import Router from 'next/router'
import { CurrentUserContext } from '../lib/auth'
import Col from 'react-bootstrap/Col'
import { PageViewEvent } from '../lib/react-ga'

const LogoutPage = () => <><PageViewEvent /><CurrentUserContext.Consumer>
  {currentUser => {
    if (process.browser) {
      if (currentUser.isLoggedIn()) {
        currentUser.logout()
        Router.push('/')
        return <Col><p>Logged out.  Redirecting you...</p></Col>
      } else {
        Router.push('/')
        return <Col><p>Not logged in.  Redirecting you...</p></Col>
      }
    } else {
      return <Col><p>Wait while we log you out...</p></Col>
    }
  }}
</CurrentUserContext.Consumer></>

export default LogoutPage

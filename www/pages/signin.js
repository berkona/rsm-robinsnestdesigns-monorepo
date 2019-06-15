import React from 'react'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import Router from 'next/router'
import { CurrentUserContext } from '../lib/auth'
import { FaSpinner } from 'react-icons/fa'

const SIGNIN = gql`
mutation Signin($email: String!, $password: String!) {
  signin(email: $email, password: $password) {
    token
  }
}
`

const signin = (props) => {
  return (
    <>
    <CurrentUserContext.Consumer>
      {currentUser => {
        if (currentUser.isLoggedIn()) {
          Router.push('/')
          return <span>You're already logged in.  Redirecting you.</span>
        } else {
          return (
            <Col>
              <div style={{ padding: '24px 24px' }}>
                <h1>Sign In</h1>
                <p>Sign into your account at Robin's Nest Designs</p>
                <hr style={{ color: '#888' }} />
                <Mutation mutation={SIGNIN}>
                  {
                    (signin, { loading, error, data }) => {
                      if (data && data.signin && data.signin.token) {
                        currentUser.login(data.signin.token)
                        Router.push('/')
                        return <span>Redirecting you..</span>
                      }

                      let email, password;
                      return (
                        <Form onSubmit={e => {
                          e.preventDefault();
                          signin({ variables: { email: email.value, password: password.value }});
                        }}>
                          <Form.Group controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control ref={node => {
                              email = node;
                            }}/>
                          </Form.Group>
                          <Form.Group controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control ref={node => {
                              password = node;
                            }} type="password" />
                          </Form.Group>
                          <Button variant="primary" type="submit">
                          {loading && <><FaSpinner /> Working...</>}
                          {!loading && <>Sign In</>}
                          </Button>
                          { error && <p style={{ color: 'red' }}>Username or password is invalid</p>}
                        </Form>
                      )
                    }
                  }
                </Mutation>
              </div>
            </Col>
          )
        }
      }}
    </CurrentUserContext.Consumer>
    </>
  )
}

export default signin

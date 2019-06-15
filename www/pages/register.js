import React from 'react'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import Router from 'next/router'
import { FaSpinner } from 'react-icons/fa'
import { CurrentUserContext } from '../lib/auth'

const REGISTER = gql`
mutation register($email: String!, $password: String!) {
  register(email: $email, password: $password) {
    token
  }
}
`

const signin = (props) =>
  <CurrentUserContext.Consumer>
    {currentUser => {
      if (currentUser.isLoggedIn()) {
        Router.push('/register-thank-you')
        return <Col><p>Redirecting you...</p></Col>
      } else {
        return (
          <Col>
            <div style={{ padding: '24px 24px' }}>
              <h1>Register</h1>
              <p>Register for an account at Robin's Nest Designs</p>
              <hr />
              <Mutation mutation={REGISTER} onCompleted={() => Router.push('/register-thank-you')}>
                {
                  (register, { loading, error, data }) => {

                    if (data && data.register && data.register.token) {
                      currentUser.login(data.register.token)
                      return <p>Account created, redirecting you.</p>
                    }

                    let email, password;
                    return (
                      <Form onSubmit={e => {
                        e.preventDefault();
                        register({ variables: { email: email.value, password: password.value }});
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
                        <Button variant="primary" type="submit" disabled={loading}>
                          {loading && <><FaSpinner /> Working...</>}
                          {!loading && <>Create Account</>}
                        </Button>
                        { error && <p style={{ color: 'red' }}>{error.graphQLErrors && error.graphQLErrors[0] && error.graphQLErrors[0].message || 'Registration encountered unknown issue'}</p>}
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

export default signin

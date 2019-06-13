import React from 'react'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { Mutation, Query } from 'react-apollo'
import gql from 'graphql-tag'
import { CurrentUserContext } from '../lib/auth'
import Loader from '../components/Loader'
import { FaSpinner } from 'react-icons/fa'
import states from '../constants/states'
import Link from 'next/link'
import { PageViewEvent } from '../lib/react-ga'

const USER_QUERY = gql`
query($token: String!) {
  user(token: $token) {
    id
    email
    firstName
    lastName
    address
    city
    state
    zip
    country
    phone
  }
}
`

const UPDATE_USER = gql`
mutation($token: String!, $user: UserPatchInput!) {
  updateUser(token: $token, user: $user) {
    id
    email
    firstName
    lastName
    address
    city
    state
    zip
    country
    phone
  }
}
`

class MyAccount extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: {}
    }
  }

  render() {
    const self = this
    return (
      <><PageViewEvent />
      <CurrentUserContext.Consumer>
        {currentUser => {
          return <Query query={USER_QUERY} variables={{ token: currentUser.getToken() }}>
            {({ loading, error, data }) => {
              if (loading) return <Loader />
              if (error) return <p>Error: {error.toString()}</p>
              return <Col>
                <div style={{ padding: '15px'}}>
                  <h2>My Account</h2>
                  <p>Modify your account details</p>
                  <hr />
                  <Form>
                    <Form.Row>
                      <Col md={6}>
                        <Form.Group controlId="firstName">
                          <Form.Label>Email</Form.Label>
                          <Form.Control placeholder="None"
                                        value={data.user.email}
                                        disabled />
                        </Form.Group>
                      </Col>
                    </Form.Row>
                  </Form>
                  <h2>Shipping Information</h2>
                  <p>We use your information to enable a faster checkout experience. <Link href={'/Policies/Policies#privacy'}><a>Privacy Policy</a></Link></p>
                  <hr />
                  <Mutation mutation={UPDATE_USER}
                            variables={{
                              token: currentUser.getToken(),
                              user: self.state.user
                            }}

                            >
                    {(mutationFn, { loading, error, mutationResult }) => {
                      return <Form onSubmit={() => { event.preventDefault(); mutationFn(); }}>
                        <Form.Row>
                          <Col md={6}>
                            <Form.Group controlId="firstName">
                              <Form.Label>First Name</Form.Label>
                              <Form.Control placeholder="None"
                                            value={self.state.user.firstName || data.user.firstName}
                                            onChange={() => self.setState({ user: { firstName: event.target.value } })} />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="lastName">
                              <Form.Label>Last Name</Form.Label>
                              <Form.Control placeholder="None"
                                            value={self.state.user.lastName || data.user.lastName}
                                            onChange={() => self.setState({ user: { lastName: event.target.value } })} />
                            </Form.Group>
                          </Col>
                        </Form.Row>
                        <Form.Row>
                          <Col md={12}>
                            <Form.Group controlId="userAddress">
                              <Form.Label>Shipping Address</Form.Label>
                              <Form.Control placeholder="None"
                                            value={self.state.user.address || data.user.address}
                                            onChange={() => self.setState({ user: { address: event.target.value } })} />
                            </Form.Group>
                          </Col>
                        </Form.Row>
                        <Form.Row>
                          <Col md={4}>
                            <Form.Group controlId="userCity">
                              <Form.Label>City</Form.Label>
                              <Form.Control placeholder="None"
                                            value={self.state.user.city || data.user.city}
                                            onChange={() => self.setState({ user: { city: event.target.value } })} />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group controlId="userState">
                              <Form.Label>State</Form.Label>
                              <Form.Control placeholder="None" as="select"
                                            value={self.state.user.state || data.user.state}
                                            onChange={() => self.setState({ user: { state: event.target.value } })}>
                                <option value={null}>None</option>
                                {[...states.map(state => <option key={state.abbreviation} value={state.abbreviation}>{state.name}</option>)]}
                              </Form.Control>
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group controlId="userZip">
                              <Form.Label>Zipcode</Form.Label>
                              <Form.Control placeholder="None"
                                            type="number"
                                            min={0}
                                            max={99999}
                                            value={self.state.user.zip || data.user.zip}
                                            onChange={() => self.setState({ user: { zip: event.target.value } })} />
                            </Form.Group>
                          </Col>
                        </Form.Row>
                        <Form.Row>
                          <Col>
                            <Form.Group controlId="userCountry">
                              <Form.Label>Country</Form.Label>
                              <Form.Control placeholder="None"
                                            value={self.state.user.country || data.user.country}
                                            onChange={() => self.setState({ user: { country: event.target.value } })} />
                            </Form.Group>
                          </Col>
                        </Form.Row>
                        <Form.Row>
                          <Col>
                            <Form.Group controlId="userPhone">
                              <Form.Label>Phone</Form.Label>
                              <Form.Control placeholder="None"
                                            value={self.state.user.phone || data.user.phone}
                                            onChange={() => self.setState({ user: { phone: event.target.value } })} />
                            </Form.Group>
                          </Col>
                        </Form.Row>
                        <Button type="submit" variant="primary" disabled={loading}>
                          { loading
                            ? <><FaSpinner /> Working...</>
                            : <>Update Account</>
                          }
                        </Button>
                        {
                          error && <p>{error.toString()}</p>
                        }
                      </Form>
                    }}
                  </Mutation>
                </div>
              </Col>
            }}
          </Query>
        }}
      </CurrentUserContext.Consumer>
      </>
    )
  }
}

export default MyAccount

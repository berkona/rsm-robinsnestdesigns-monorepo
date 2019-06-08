import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import Link from 'next/link'
import Router from 'next/router'
import { SearchLinkStr } from './Links'
import { withRouter } from 'next/router'
import { parseCookies } from 'nookies'
import { CurrentUserContext } from '../lib/auth'

class MyNavbar extends React.Component {
  static contextType = CurrentUserContext

  static async getInitialProps(ctx) {
    return {
      cookies: parseCookies(ctx)
    }
  }

  constructor(props) {
      super(props);

      const {
        searchPhrase,
        categoryId,
        subcategoryId,
        onSaleOnly,
        newOnly
      } = props.router.query

  		this.state = {
        searchPhrase,
        categoryId,
        subcategoryId,
        onSaleOnly,
        newOnly,
  		}

      this.handleSearchChange = this.handleSearchChange.bind(this);
      this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
  }

  handleSearchChange() {
      this.setState({
        searchPhrase: event.target.value
      })
  }

  handleSearchSubmit() {
    event.preventDefault()
    Router.push(SearchLinkStr(this.state));
  }

  render () {
    const isLoggedIn = this.context.isLoggedIn()
    return (
      <Navbar bg="light" expand="lg">
        <Link href="/">
          <Navbar.Brand>Robin's Nest Designs</Navbar.Brand>
        </Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Form inline onSubmit={this.handleSearchSubmit}>
            <FormControl type="text" placeholder="Search" className="mr-sm-2" value={this.state.searchPhrase} onChange={this.handleSearchChange} />
            <Button variant="dark" type="submit">Search</Button>
          </Form>
          <Nav className="ml-auto">
            {isLoggedIn
              ?
              <>
              <Nav.Item>
                <Link href="/myaccount" passHref>
                  <Nav.Link>My Account</Nav.Link>
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link href="/wishlist" passHref>
                  <Nav.Link>My Wish List</Nav.Link>
                </Link>
              </Nav.Item>
              </>
              :
              <>
                <Nav.Item>
                  <Link href="/register" passHref>
                    <Nav.Link>Register</Nav.Link>
                  </Link>
                </Nav.Item>
                <Nav.Item>
                  <Link href="/signin" passHref>
                    <Nav.Link>Sign In</Nav.Link>
                  </Link>
                </Nav.Item>
              </>
            }
            <Nav.Item>
              <Link href="/cart" passHref>
                <Nav.Link>My Cart</Nav.Link>
              </Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

export default withRouter(MyNavbar)

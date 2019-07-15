import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Form from 'react-bootstrap/Form'
import NavDropdown from 'react-bootstrap/NavDropdown'
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

  componentDidUpdate() {
    const {
      categoryId,
      subcategoryId,
      onSaleOnly,
      newOnly
    } = this.props.router.query
    if (categoryId != this.state.categoryId
      || subcategoryId != this.state.subcategoryId
      || onSaleOnly != this.state.onSaleOnly
      || newOnly != this.state.newOnly) {
        this.setState({
          categoryId,
          subcategoryId,
          onSaleOnly,
          newOnly
        })
      }
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
        <style jsx global>{`
          @media (max-width: 576px) {
            .navbar .form-inline .form-control {
              width: 120px;
              margin-right: 5px;
            }
          }
        `}</style>
        <Link href="/">
          <a>
            <Navbar.Brand>Home</Navbar.Brand>
          </a>
        </Link>
        <Form inline onSubmit={this.handleSearchSubmit}>
          <FormControl type="text" placeholder="Search" className="mr-sm-2" value={this.state.searchPhrase} onChange={this.handleSearchChange} />
          <Button variant="dark" type="submit">Search</Button>
        </Form>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Item className="xs-d-block sm-d-none">
              <Link href="/categories" passHref>
                <Nav.Link>Browse</Nav.Link>
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link href="/subscribe" passHref>
                <Nav.Link>Subscribe</Nav.Link>
              </Link>
            </Nav.Item>
            {isLoggedIn
              ?
              <>
              <NavDropdown title="My Account" id="basic-nav-dropdown">
                <NavDropdown.Item href="/myaccount">Profile</NavDropdown.Item>
                <NavDropdown.Item href="/wishlist">Wish List</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="/logout">Log out</NavDropdown.Item>
              </NavDropdown>
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

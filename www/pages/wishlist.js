import React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import { CurrentUserContext } from '../lib/auth'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Loader from '../components/Loader'
import ApolloError from '../components/ApolloError'
import SEO from '../components/SEO'
import ProductTeaser from '../components/ProductTeaser'
import { PageViewEvent } from '../lib/react-ga'

const WISHLIST_QUERY = gql`
query($token: String!) {
  wishlist(token: $token) {
    id
    dateAdded
    product {
      id
      name
      isOnSale
      price
      salePrice
      category
      subcategory
      hyperlinkedImage
      thumbnail
      image
      productVariants {
        price
      }
    }
  }
}
`
const WishListPage = (props) => <Col>
  <SEO title="Wish List" description="See all your favorited items in one place"></SEO>
  <PageViewEvent />
  <div style={{ padding: '16px'}}>
    <h2>My Wish List</h2>
    <hr />
    <CurrentUserContext.Consumer>
      {currentUser => <Query query={WISHLIST_QUERY}
                             variables={{ token: currentUser.getToken() }}>
        {({ loading, error, data }) => {
          if (loading) return <Loader />
          if (error) return <ApolloError error={error} />
          return <Container>
            <Row>
              { (!data || data.wishlist.length == 0) && <Col><div style={{ padding: '150px' }}align="center"><h2>You haven't added any items to your wishlist</h2></div></Col> }
              {[...data.wishlist.map(wishListItem => <Col xs={6} md={4} lg={3} key={wishListItem.id}>
                  <ProductTeaser product={wishListItem.product} />
                </Col>)
              ]}
            </Row>
            </Container>
        }}
      </Query>}
    </CurrentUserContext.Consumer>
  </div>
</Col>

export default WishListPage

import React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import { CurrentUserContext } from '../lib/auth'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Loader from '../components/Loader'
import ApolloError from '../components/ApolloError'
import ProductTeaser from '../components/ProductTeaser'

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

const Wishlist = (props) => (
  <CurrentUserContext.Consumer>
    {currentUser => <Query query={WISHLIST_QUERY}
                           variables={{ token: currentUser.getToken() }}>
      {({ loading, error, data }) => {
        if (loading) return <Loader />
        if (error) return <ApolloError error={error} />
        return <Container>
          <Row>
            { (!data || data.wishlist.length == 0) && <Col><div style={{ padding: '150px' }}align="center"><h2>You haven't added any items to your wishlist</h2></div></Col> }
            {[...data.wishlist.map(wishListItem => <Col sm={12} md={6} lg={4} xl={3} key={wishListItem.id}>
                <ProductTeaser product={wishListItem.product} />
              </Col>)
            ]}
          </Row>
          </Container>
      }}
    </Query>}
  </CurrentUserContext.Consumer>
)

export default Wishlist

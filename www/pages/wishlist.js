import React from 'react'
import Col from 'react-bootstrap/Col'
import SEO from '../components/SEO'
import Wishlist from '../components/Wishlist'

const WishListPage = (props) => <Col>
  <SEO title="Wish List" description="See all your favorited items in one place"></SEO>
  <div style={{ padding: '16px'}}>
    <h2>My Wish List</h2>
    <hr />
    <Wishlist />
  </div>
</Col>

export default WishListPage

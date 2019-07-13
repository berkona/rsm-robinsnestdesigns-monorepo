import React from 'react'
import SEO from '../components/SEO'
import Wishlist from '../components/Wishlist'
import ContentWithSidebar from '../components/ContentWithSidebar'

const WishListPage = (props) => <ContentWithSidebar>
  <SEO title="Wish List" description="See all your favorited items in one place"></SEO>
  <div style={{ padding: '16px'}}>
    <h2>My Wish List</h2>
    <hr />
    <Wishlist />
  </div>
</ContentWithSidebar>

export default WishListPage

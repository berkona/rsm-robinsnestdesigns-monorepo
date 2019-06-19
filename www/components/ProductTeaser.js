import React from "react"
import { ProductLink } from "./Links"
import PriceDisplay from './PriceDisplay'
import { Impression, Actions } from '../lib/next-ga-ec'
import { FaCartPlus, FaSpinner, FaCheckCircle, FaTimesCircle, FaHeart, FaHeartBroken } from 'react-icons/fa'
import Button from 'react-bootstrap/Button'
import { CurrentUserContext } from '../lib/auth'
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import Form from 'react-bootstrap/Form'
import Fade from 'react-bootstrap/Fade'
import Router from 'next/router'
import { CART_GET, WISHLIST_QUERY_ALL, WISHLIST_QUERY, REMOVE_FROM_WISHLIST, ADD_TO_WISHLIST } from '../constants/queries'

const ADD_TO_CART = gql`
  mutation addToCart($productId: ID!, $qty: Int!, $orderId: ID, $variant: ID) {
    addToCart(productId: $productId, qty: $qty, orderId: $orderId, variant: $variant) {
      id
      subtotal
      items {
        id
        qty
        variant
        product {
          id
          sku
          name
          price
        }
      }
    }
  }
`


class ProductTeaserOverlay extends React.Component {

    constructor(props) {
      super(props)
      this.onMouseEnter = this.onMouseEnter.bind(this)
      this.onMouseLeave = this.onMouseLeave.bind(this)
      this.state = {
        showOverlay: false
      }
    }

    onMouseEnter() {
      this.setState({ showOverlay: true })
    }

    onMouseLeave() {
        this.setState({ showOverlay: false })
    }

    render() {
      const wishListVars = { token: this.props.currentUser.getToken(), productId: this.props.product.id }
      return <div style={{ height: '100%', width: '100%' }} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        {this.props.children}
        <Fade in={this.state.showOverlay}>
          <div style={{ background: 'rgba(0, 0, 0, 0.5)', width: '100%', height: '100%', position: 'absolute', top: '0', left: '0' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-around' }}>
                {
                  this.props.currentUser.isLoggedIn()
                  ? <Query query={WISHLIST_QUERY} variables={wishListVars}>
                    {({ loading, error, data }) => {
                      if (loading) {
                        return <Button disabled variant="light">
                          <FaSpinner />
                        </Button>
                      }

                      if (error) {
                        console.error('could not get wishlist', error);
                        return <Button disabled variant="danger">
                          <FaTimesCircle />
                        </Button>
                      }

                      const { isInWishlist } = data
                      if (isInWishlist) {
                        return <Mutation mutation={REMOVE_FROM_WISHLIST} variables={wishListVars} refetchQueries={() => [{ query: WISHLIST_QUERY, variables: wishListVars }, { query: WISHLIST_QUERY_ALL, variables: { token: this.props.currentUser.getToken() }}]}>
                        {(mutationFn, { loading, error, data }) => {
                          if (loading) {
                            return <Button disabled variant="light">
                              <FaSpinner />
                            </Button>
                          }

                          if (error) {
                            console.error('could not add to wishlist', error);
                            return <Button disabled variant="danger">
                              <FaTimesCircle />
                            </Button>
                          }

                          return <Button variant="light" onClick={(e) => { e.preventDefault(); e.stopPropagation(); mutationFn(); }}>
                            <FaHeartBroken />
                          </Button>
                        }}
                        </Mutation>
                      } else {
                        return <Mutation mutation={ADD_TO_WISHLIST} variables={wishListVars} refetchQueries={() => [{ query: WISHLIST_QUERY, variables: wishListVars }, { query: WISHLIST_QUERY_ALL, variables: { token: this.props.currentUser.getToken() }}]}>
                        {(mutationFn, { loading, error, data }) => {
                          if (loading) {
                            return <Button disabled variant="light">
                              <FaSpinner />
                            </Button>
                          }

                          if (error) {
                            console.error('could not add to wishlist', error);
                            return <Button disabled variant="danger">
                              <FaTimesCircle />
                            </Button>
                          }

                          return <Button variant="light" onClick={(e) => { e.preventDefault(); e.stopPropagation(); mutationFn(); }}>
                            <FaHeart />
                          </Button>
                        }}
                        </Mutation>
                      }
                    }}
                  </Query>
                  : <Button disabled variant="light">
                    <FaHeart />
                  </Button>
                }

                <Query query={CART_GET} variables={{ orderId: this.props.currentUser.getCartId() }}>
                  {({ loading, error, data }) => {
                    const AddToCartBtn = () => {
                      return <Mutation
                        mutation={ADD_TO_CART}
                        variables={{
                          productId: this.props.product.id,
                          orderId: this.props.currentUser.getCartId(),
                          qty: 1,
                        }}
                        refetchQueries={() => [{ query: CART_GET, variables: { orderId: this.props.currentUser.getCartId() }}]}
                        onCompleted={(data) => {
                          if (!this.props.currentUser.getCartId() && data && data.addToCart && data.addToCart.id) {
                            console.log('setting cartId to ', data.addToCart.id)
                            this.props.currentUser.setCartId(data.addToCart.id)
                          }
                          Actions.AddToCart({
                            sku: this.props.product.sku,
                            name: this.props.product.name,
                            category: this.props.product.category + '/' + this.props.product.subcategory,
                            price: this.props.product.isOnSale ? this.props.product.price : this.props.product.salePrice,
                            qty: 1,
                            list: this.props.list,
                            position: this.props.position,
                          })
                        }}
                        >
                        {(mutationFn, { loading, error, data }) => {
                          if (loading) {
                            return <Button disabled variant="light">
                              <FaSpinner />
                            </Button>
                          }
                          if (error) {
                            console.error('could not add to cart', error);
                            return <Button disabled variant="danger">
                              <FaTimesCircle />
                            </Button>
                          }
                          if (data) {
                            return <Button variant="success" onClick={(e) => { e.preventDefault(); e.stopPropagation(); Router.push('/cart'); }}>
                              <FaCheckCircle />
                            </Button>
                          }
                          return <Button
                            disabled={this.props.product.productVariants.length !== 0}
                            variant="light"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); mutationFn(); }}
                            style={{ fontSize: '20px' }}>
                            <FaCartPlus />
                          </Button>
                        }}
                      </Mutation>
                    }

                    if (loading) {
                      return <Button disabled variant="light">
                        <FaSpinner />
                      </Button>
                    }

                    if (error) {
                      // prolly just no cart
                      return AddToCartBtn()
                    }

                    const [ firstMatchingItem ] = (data
                                       && data.cart
                                       && data.cart.items
                                       && data.cart.items.filter((x) => x.product.id ==  this.props.product.id)
                                       || [])
                    const isInCart = !!firstMatchingItem
                    if (isInCart) {
                      return <Button variant="success" onClick={(e) => { e.preventDefault(); e.stopPropagation(); Router.push('/cart'); }}>
                        <FaCheckCircle />
                      </Button>
                    } else {
                      return AddToCartBtn()
                    }
                  }}
                </Query>
              </div>
            </div>
          </div>
        </Fade>
      </div>
    }
}

const ProductTeaser = (props) => {
    const isOnSale = props.product.isOnSale
    return (
      <CurrentUserContext.Consumer>
       {currentUser => (
         <ProductLink productId={props.product.id}
                      sku={props.product.sku}
                      category={props.product.category}
                      subcategory={props.product.subcategory}
                      title={props.product.name}
                      listName={props.listName}
                      position={props.position}>

           <Impression sku={props.product.sku}
                       name={props.product.name}
                       category={`${props.product.category}/${props.product.subcategory}`}
                       list={props.listName}
                       position={props.position}
           />

           <div className="product-teaser"
            style={{
              border: '1px solid rgba(0,0,0,.125)',
              borderRadius: '.25rem',
              height: '222px',
              marginBottom: '10px',
              padding: '10px',
            }}>

             <div className="product-thumbnail">
             <ProductTeaserOverlay product={props.product}
                                   list={props.listName}
                                   position={props.position}
                                   currentUser={currentUser}>
                <div style={{ width: '100%', height: '100%', position: 'absolute', top: '0', left: '0' }}>
                  {
                    (props.product.hyperlinkedImage || props.product.thumbnail || props.product.image)
                    ? <img src={props.product.hyperlinkedImage || `https://www.robinsnestdesigns.com/ahpimages/${props.product.image || props.product.thumbnail}`}></img>
                    : <img src="/static/no-image.png"/>
                  }
                </div>
              </ProductTeaserOverlay>
             </div>
             <h3 className="product-teaser-title">{props.product.name}</h3>
             <PriceDisplay product={props.product} isOnSale={isOnSale} />
           </div>
         </ProductLink>
       )
       }
       </CurrentUserContext.Consumer>
    )
}

export default ProductTeaser

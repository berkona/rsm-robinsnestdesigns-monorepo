/**
 * A file for common GraplQL queries
 */
import gql from 'graphql-tag'

export const ORDER_GET = gql`
  query($orderId: ID!, $shipping: Float, $county: String) {
    cart(orderId: $orderId, shipping: $shipping, county: $county) {
      id
      placed
      subtotal
      shipping
      tax
      total
      items {
        id
        price
        qty
        variant
        product {
          id
          sku
          name
          price
          salePrice
          isOnSale
          description
          category
          subcategory
          hyperlinkedImage
          image
          thumbnail
          productVariants {
            id
            text
          }
        }
      }
    }
  }
`

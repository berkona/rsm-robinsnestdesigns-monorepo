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

export const CATEGORY_GET = gql`
  query {
    allCategories {
      id
      title
    }
  }
`

export const SUBCATEGORY_GET_ALL = gql`
query {
  allSubcategories {
    id
    title
  }
}
`
export const PRODUCT_GET_ONE = gql`
query($productId: ID!) {
  product(productId: $productId) {
    id
    sku
    name
    description
    price
    salePrice
    saleStart
    saleEnd
    category
    categoryId
    subcategory
    subcategoryId
  }
}
`

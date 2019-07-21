/**
 * A file for common GraplQL queries
 */
import gql from 'graphql-tag'

export const ORDER_GET = gql`
  query($orderId: ID!, $shipping: Float, $county: String, $promo: String) {
    cart(orderId: $orderId, shipping: $shipping, county: $county, promo: $promo) {
      id
      placed
      subtotal
      shipping
      discount
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
      comments
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
export const SUBCATEGORY_GET_ONE = gql`
query($categoryId: ID) {
  allSubcategories(categoryId: $categoryId) {
    id
    title
    comments
  }
}
`

export const PRODUCT_GET_PAGE = gql`
query(
  $categoryId: ID,
  $subcategoryId: ID,
  $searchPhrase: String,
  $onSaleOnly: Boolean,
  $newOnly: Boolean,
  $sort: ProductSortType,
  $skip: Int!,
  $limit: Int!) {
  allProducts(
    categoryId: $categoryId,
    subcategoryId: $subcategoryId,
    searchPhrase: $searchPhrase,
    onSaleOnly: $onSaleOnly,
    newOnly: $newOnly,
    skip: $skip,
    limit: $limit,
    sort: $sort) {
    total
    records {
      id
      sku
      name
      category
      subcategory
      isOnSale
      price
      salePrice
      saleStart
      saleEnd
      description
      qtyInStock
      image
      thumbnail
      hyperlinkedImage
      productVariants {
        id
        price
      }
    }
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
    qtyInStock
    salePrice
    saleStart
    saleEnd
    category
    categoryId
    subcategory
    subcategoryId
    category2
    subcategory2
    category3
    subcategory3
    keywords
    hyperlinkedImage
    image
    thumbnail
    productVariants {
      id
      price
      text
    }
  }
}
`

export const CART_GET = gql`
query($orderId: ID!) {
  cart(orderId: $orderId) {
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

export const WISHLIST_QUERY_ALL = gql`
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

export const WISHLIST_QUERY = gql`
query($token: String!, $productId: ID!) {
  isInWishlist(token: $token, productId: $productId) @client
}
`

export const ADD_TO_WISHLIST = gql`
mutation($token: String!, $productId: ID!) {
  addToWishList(token: $token, productId: $productId)
}
`

export const REMOVE_FROM_WISHLIST = gql`
mutation($token: String!, $productId: ID!) {
  removeFromWishList(token: $token, productId: $productId)
}
`

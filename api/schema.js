const { gql } = require('apollo-server-micro')

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    category(categoryId: ID!): Category!
    saleCategories: [Category!]!
    allCategories: [Category!]!
    allSubcategories(categoryId: ID!): [SubCategory!]!
    product(productId: ID!): Product
    allProducts(
      categoryId: ID,
      subcategoryId: ID,
      searchPhrase: String,
      onSaleOnly: Boolean,
      newOnly: Boolean,
      skip: Int,
      limit: Int,
      sort: ProductSortType
    ): ProductList!
    cart(orderId: ID!, shipping: Float, zipcode: Int, county: String): Order
  }

  input PriceRange {
    lower: Float!
    higher: Float!
  }

  type Mutation {
    register(
      email: String!,
      password: String!,
      firstName: String!,
      lastName: String!
    ): AuthPayload
    signin(email: String!, password: String!): AuthPayload
    addToCart(productId: ID!, qty: Int!, orderId: ID, variant: ID): Order!
    updateCartItem(cartItemId: ID!, qty: Int!, variant: ID): Order!
    removeFromCart(cartItemId: ID!): Order!
    placeOrder(orderId: ID!, paypalOrderId: ID!, shipping: Float!, zipcode: Int!, county: String): Order!
  }

  type Order {
      id: ID!
      placed: Boolean!
      items: [CartItem!]!
      subtotal: Float!
      tax: Float!
      shipping: Float!
      total: Float!
      customerInfo: CustomerInfo
  }

  type CustomerInfo {
    OrderPlaced: Boolean!,
    OrderFilled: Boolean!,
    FirstName: String!,
    LastName: String!,
    Phone: String!,
    Email: String!,
    Address: String!,
    City: String!,
    State: String!,
    Zip: Int!,
    Country: String!,
    BFirstName: String!,
    BLastName: String!,
    BAddress: String!,
    BCity: String!,
    BState: String!,
    BZip: Int!,
    BCountry: String!,
    BPhone: String!,
    BEmail: String!,
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type CartItem {
    id: ID!
    product: Product!
    qty: ID!
    variant: ID
  }

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    address: String
    city: String
    state: String
    zip: String
    country: String
    phone: String
    businessEmail: String
    businessFirstName: String
    businessLastName: String
    businessAddress: String
    businessCity: String
    businessState: String
    businessZip: String
    businessCountry: String
    businessPhone: String
  }

  enum ProductSortType {
      relevancy
      mostRecent
      alpha
      priceAsc
      priceDesc
      random
  }

  type Category {
    id: Int!
    title: String!
    comments: String
  }

  type SubCategory {
    id: Int!
    title: String!
    comments: String
  }

  type ProductList {
    total: Int!
    skip: Int!
    limit: Int!
    records: [Product!]!
  }

  type Product {
    id: Int!
    sku: String!
    name: String!
    price: Float!
    qtyInStock: Int!
    salePrice: Float
    saleStart: String
    saleEnd: String
    description: String
    image: String
    thumbnail: String
    hyperlinkedImage: String
    category: String!
    categoryId: ID!
    subcategory: String!
    subcategoryId: ID!
    productVariants: [ProductVariant!]!
  }

  type ProductVariant {
    price: Float!
    text: String!
  }

`

exports.typeDefs = typeDefs;

const { gql } = require('apollo-server-express')

// Construct a schema, using GraphQL schema language
const typeDefs = gql`

  type Query {
    category(categoryId: Int!): Category!
    allCategories: [Category!]!
    allSubcategories(categoryId: Int!): [SubCategory!]!
    product(productId: Int!): Product
    allProducts(subcategoryId: Int!, searchPhrase: String, skip: Int, limit: Int): ProductList!
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
    salePrice: Float
    saleStart: String
    saleEnd: String
    description: String
    image: String
    thumbnail: String
    category: String!
    subcategory: String!
  }

`

exports.typeDefs = typeDefs;

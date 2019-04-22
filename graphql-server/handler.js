const { ApolloServer } = require('apollo-server-express')

const { MyDB } = require('./datasources')
const { typeDefs } = require('./schema')
const { resolvers } = require('./resolvers')

const isDev = process.env.NODE_ENV !== 'production'

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: isDev,
  playground: isDev,
  tracing: isDev,
  dataSources: () => {
    return {
      db: new MyDB(),
    }
  },
})

exports.graphqlServer = server

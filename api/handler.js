const { ApolloServer } = require('apollo-server-micro')

const { MyDB } = require('./datasources')
const { typeDefs } = require('./schema')
const { verifyAuthToken, resolvers } = require('./resolvers')

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
  }
})

module.exports = server.createHandler({
  cors: {
    origin: true,
    credentials: true,
    allowedHeaders: 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,X-Apollo-Tracing'
  },
})

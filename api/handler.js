const { ApolloServer } = require('apollo-server-micro')

const { knex, MyDB } = require('./datasources')
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

const graphqlHandler = server.createHandler({
  cors: {
    origin: true,
    credentials: true,
    allowedHeaders: 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,X-Apollo-Tracing'
  },
})

module.exports = async (req, res) => {
  await knex.initialize()
  try {
    await graphqlHandler(req, res)
  } finally {
    await knex.destroy()
  }
}

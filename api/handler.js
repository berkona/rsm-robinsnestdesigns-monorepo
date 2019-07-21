const { ApolloServer } = require('./apollo-server')
const { MyDB } = require('./datasources')
const { typeDefs } = require('./schema')
const { resolvers } = require('./resolvers')
const knex = require('./knex')

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

const LOG_THRESHOLD = 2000

module.exports = async (req, res) => {
  const startTime = Date.now()
  await knex.initialize()
  try {
    await graphqlHandler(req, res)
  } finally {
    const endTime = Date.now()
    if (endTime - startTime > LOG_THRESHOLD) {
      console.log(
        'ERROR - slow request detected:\n',
        'Total time to handle request', endTime - startTime, '\n',
        'req.body', req.body, '\n'
      )
    }
    await knex.destroy()
  }
}

const { ApolloServer } = require('apollo-server-micro')

const { MyDB } = require('./datasources')
const { typeDefs } = require('./schema')
const { verifyAuthToken, resolvers } = require('./resolvers')

const isDev = process.env.NODE_ENV !== 'production'

if (!process.env.SQL_ENGINE || !process.env.SQL_PORT || !process.env.SQL_HOST || !process.env.SQL_USER || !process.env.SQL_PWD || !process.env.SQL_DB) {
  throw new Error('You must set the environmental variables: SQL_ENGINE, SQL_PORT, SQL_HOST, SQL_USER, SQL_PWD, SQL_DB before starting server')
}

const knex = require('knex')({
  client: process.env.SQL_ENGINE,
  connection: {
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    port: process.env.SQL_PORT,
    password: process.env.SQL_PWD,
    database: process.env.SQL_DB,
  },
})

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: isDev,
  playground: isDev,
  tracing: isDev,
  dataSources: () => {
    return {
      db: new MyDB(knex),
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

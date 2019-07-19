
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
  pool: { min: 0, max: 4 }
})

module.exports = knex

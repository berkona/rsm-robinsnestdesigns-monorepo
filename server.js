const express = require('express')
const next = require('next')

const graphqlHandler = require('./graphql-server/handler')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app
  .prepare()
  .then(() => {
    const expressApp = express()

		graphqlHandler.graphqlServer.applyMiddleware({ app: expressApp })

		if (dev) {
      const playground = require('graphql-playground-middleware-express').default
      const playgroundHandler = playground({
        endpoint: '/graphql',
      })
			expressApp.get('/playground', playgroundHandler)
		}

		expressApp.get('/category/:categoryId', (req, res) => {
			app.render(req, res, '/category', { categoryId: req.params.categoryId })
		})

    let handleSearch = (req, res) => {
      const params = {
        subcategoryId: req.params.subcategoryId ,
        pageNo: req.params.pageNo,
        searchPhrase: req.params.searchPhrase,
      }
			app.render(req, res, '/subcategory', params)
		}

    expressApp.get('/search/:searchPhrase/page/:pageNo', handleSearch)
    expressApp.get('/subcategory/:subcategoryId/page/:pageNo', handleSearch)
    expressApp.get('/subcategory/:subcategoryId/search/:searchPhrase/page/:pageNo', handleSearch)

    expressApp.get('/product/:productId', (req, res) => {
      app.render(req, res, '/product', { productId: req.params.productId })
    })

    expressApp.get('*', (req, res) => {
      return handle(req, res)
    })

    expressApp.listen(3000, err => {
      if (err) throw err
      console.log('> Ready on http://localhost:3000')
    })
  })
  .catch(ex => {
    console.error(ex.stack)
    process.exit(1)
  })

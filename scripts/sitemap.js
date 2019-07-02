const fs = require('fs')
const url = require('url')
const sitemap = require('sitemap')
const slugify = require('slugify')
const { knex, MyDB } = require('../api/datasources')

const ProductLinkStr = (props) => (
  `/product/${props.productId}/${slugify('' + props.category)}/${slugify('' + props.subcategory)}/${slugify('' + props.title)}?listref=${props.listName}`
)

const SearchLinkStr = (args) => {
  args = Object.assign({}, args)
  const { categoryId, subcategoryId, pageNo } = args
  delete args.categoryId
  delete args.subcategoryId
  delete args.pageNo

  let queryString = Object.keys(args).filter(key => key && args[key]).map(key => key + '=' + args[key]).join('&')
  if (queryString.length > 0) queryString = '?' + queryString
  let url = '/search'
  if (categoryId) {
    url += '/c/' + categoryId
  }
  if (subcategoryId) {
    url += '/sc/' + subcategoryId
  }
  if (pageNo) {
    url += '/p/' + pageNo
  }
  return url + queryString
}

const makeUrlObj = (url, changefreq, priority) => {
  changefreq = changefreq || 'daily'
  priority = priority || 0.5
  return { url, changefreq, priority }
}

const WaitPromise = (ms) => {
  return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), ms)
  })
}

const dbWithRetry = async (dbfn, nRetries = 10) => {
  let waitTime = 100
  let waitGrowth = 2.5
  let lastErr = null
  for (let i = 0; i < nRetries; i++) {
    try {
      const retVal = await dbfn()
      return retVal
    } catch (err) {
      lastErr = err
      console.error('DB encountered error, trying again after ' + waitTime + ' ms', err)
      await WaitPromise(waitTime)
      waitTime *= waitGrowth
    }
  }
  throw new Error('Maximum retries exhausted', lastErr)
}

const addAllPages = async (db, urls, args) => {
  const [ _, countRow ] = await dbWithRetry(() => db.listProducts(args))
  const total = countRow[0].nRecords
  const limit = 50
  const nPages = Math.ceil(total / limit)
  console.log('Adding', nPages, 'pages from', args)
  for (let page = 1; page <= nPages; page++) {
    let linkArgs = Object.assign({}, args, { pageNo: page })
    urls.add(SearchLinkStr(linkArgs))
  }
}

const handler = async (hostname) => {
  if (!hostname) throw new Error("Set SITE_URL before continuing")

  const cacheTime = 600000
  const urls = new Set()
  const db = new MyDB()
  await db.initialize({ context: {} })

  const [ _, countRow ] = await dbWithRetry(() => db.listProducts())
  const total = countRow[0].nRecords
  const limit = 1000
  const nPages = Math.ceil(total / limit)
  for (let page = 1; page <= nPages; page++) {
    const [ rows ] = await dbWithRetry(() => db.listProducts({ skip: (page-1) * limit, limit, }))
    console.log('Processing', { skip: (page-1) * limit, limit, })
    rows.forEach(productRow => {
      const props = {
        productId: productRow.ProductID,
        category: productRow.Category,
        subcategory: productRow.Subcategory,
        title: productRow.ItemName,
        listName: 'sitemap',
      }
      urls.add(ProductLinkStr(props))
    })
  }

  const [ __1, __2, categories ] = await dbWithRetry(() => db.listProducts())
  await Promise.all(categories.map(async (category) => {
    const categoryArgs = { categoryId: category.ID }
    urls.add(SearchLinkStr(categoryArgs))
    //await addAllPages(db, urls, categoryArgs)
    const [ __3, __4, __5, allSubcategories ] = await dbWithRetry(() => db.listProducts(categoryArgs))
    await Promise.all(allSubcategories.map(async (subcategory) => {
      const subcatArgs = { categoryId: category.ID, subcategoryId: subcategory.ID }
      urls.add(SearchLinkStr(subcatArgs))
      //await addAllPages(db, urls, subcatArgs)
    }))
  }))

  return sitemap.createSitemap({
    hostname,
    cacheTime,
    urls: Array.from(urls).map(u => makeUrlObj(u)),
  }).toString()
}

const [ nodePath, scriptPath, hostname, sitemapDest ] = process.argv

if (!hostname) {
  console.log('USAGE: node sitemap.js HOSTNAME [FILE]')
} else {
  handler(hostname).then((sitemap) => {
    fs.writeFileSync(sitemapDest || 'sitemap.xml', sitemap)
    console.log('sitemap generated')
  }).catch(err => {
    console.error('Error generating sitemap', err)
  }).finally(() => knex.destroy())
}

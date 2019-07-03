const stream = require('stream');
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

const timeAsyncFn = async (fn, title) => {
  const startTime = Date.now()
  try {
    const retVal = await fn()
    return retVal
  } finally {
    const endTime = Date.now()
    console.log('timeAsyncFn', title, 'took', endTime - startTime, 'ms')
  }
}

const addProductUrls = async (db, urls) => {
  const productStream = knex.select(
    'Products.ID as ProductID',
    'Products.ItemName as ItemName',
    'Category.Category as Category',
    'Subcategory.Subcategory as Subcategory')
  .from('Products')
  .innerJoin('Category', 'Products.Category', 'Category.ID')
  .innerJoin('Subcategory', 'Products.SubCategory', 'Subcategory.ID')
  .where('Active', 1)
  .stream()

  for await (const productRow of productStream) {
    const props = {
      productId: productRow.ProductID,
      category: productRow.Category,
      subcategory: productRow.Subcategory,
      title: productRow.ItemName,
      listName: 'sitemap',
    }
    urls.add(makeUrlObj(ProductLinkStr(props)))
  }
}

const getCategories = () => knex.raw(`
  select Category as ID,
  count(Products.ID) as nProducts from Products
  where Active = 1 and Category is not null
  group by Category
  having nProducts > 0
  union
  select CategoryB as ID,
  count(Products.ID) as nProducts from Products
  where Active = 1 and CategoryB is not null
  group by CategoryB
  having nProducts > 0
  union
  select CategoryC as ID,
  count(Products.ID) as nProducts from Products
  where Active = 1 and CategoryC is not null
  group by CategoryC
  having nProducts > 0
`)

const getSubcategories = () => knex.raw(`
  select Subcategory.Category as Category, Products.SubCategory as ID,
  count(Products.ID) as nProducts from Products
  inner join Subcategory on Subcategory.ID = Products.SubCategory
  where Active = 1 and Products.SubCategory is not null
  group by Products.SubCategory
  having nProducts > 0
  union
  select Subcategory.Category as Category, SubCategoryB as ID,
  count(Products.ID) as nProducts from Products
  inner join Subcategory on Subcategory.ID = Products.SubCategoryB
  where Active = 1 and Products.SubCategoryB is not null
  group by SubCategoryB
  having nProducts > 0
  union
  select Subcategory.Category as Category, SubCategoryC as ID,
  count(Products.ID) as nProducts from Products
  inner join Subcategory on Subcategory.ID = Products.SubCategoryC
  where Active = 1 and Products.SubCategoryC is not null
  group by SubCategoryC
  having nProducts > 0
`)

const addSearchUrls = async(db, urls) => {

  const processCategories = async () => {
    const allCategories = await dbWithRetry(getCategories)
    allCategories.forEach(category => {
      const categoryArgs = { categoryId: category.ID }
      urls.add(makeUrlObj(SearchLinkStr(categoryArgs)))
    })
  }

  const processSubcategories = async () => {
    const allSubcategories = await dbWithRetry(getSubcategories)
    allSubcategories.forEach(subcategory => {
      const subcatArgs = { categoryId: subcategory.Category, subcategoryId: subcategory.ID }
      urls.add(makeUrlObj(SearchLinkStr(subcatArgs)))
    })
  }

  await Promise.all([
    timeAsyncFn(processCategories, 'processCategories'),
    timeAsyncFn(processSubcategories, 'processSubcategories'),
  ])
}

const handler = async (hostname) => {
  if (!hostname) throw new Error("Set SITE_URL before continuing")

  const cacheTime = 600000
  const db = new MyDB()
  await db.initialize({ context: {} })

  const urls = sitemap.createSitemap({
    hostname,
    cacheTime,
  })

  await Promise.all([
    timeAsyncFn(() => addProductUrls(db, urls), 'addProductUrls'),
    timeAsyncFn(() => addSearchUrls(db, urls), 'addSearchUrls')
  ])

  return await timeAsyncFn(() => urls.toString(), 'sitemap.createSitemap')
}

const main = async () => {
  const [ , , hostname, sitemapDest ] = process.argv

  if (!hostname) {
    console.log('USAGE: node sitemap.js HOSTNAME [FILE]')
  } else {
    const sitemap = await timeAsyncFn(() => handler(hostname), 'handler')
    await timeAsyncFn(() => fs.writeFileSync(sitemapDest || 'sitemap.xml', sitemap), 'writeFileSync')
    console.log('sitemap generated')
  }
}

main().finally(() => knex.destroy())
const knex = require('../api/knex')
const { MyDB } = require('../api/datasources')
const searchEngine = require('../api/searchEngine')
const reduceProduct = require('../api/reduceProduct')

const nextTick = () => new Promise((resolve, reject) => setTimeout(() => resolve(), 10 + Math.random() * 90))

const processProduct = async (db, productId) => {
  const [ row ] = await db.getProduct(productId)
  const product = reduceProduct(row)
  await searchEngine.add(product)
}

const processSuccess = (productId) => console.log('Imported', productId)

const processError = (productId, error) => console.error('Error importing', productId, error)

const THROTTLE_THRESHOLD = 0.05
const THROTTLE_DOWN_TIME_FACTOR = 1/8
const THROTTLE_UP_TIME_FACTOR = 1/2
const CONCURRENCY_GROWTH_FACTOR = 16
const CONCURRENCY_GROWTH_MIN = 1

const processAllProducts = async (db) => {
  const promises = []
  try {

    const query = knex.select('ID as productId')
                      .from('Products')
                      .where('Active', 1)
                      .whereNotIn('ID', builder => builder
                        .select('record')
                        .from(searchEngine.keywordTableName)
                        .distinct()
                      )
                      .stream()

    let concurrency = CONCURRENCY_GROWTH_MIN
    let nRunning = 0
    let nTotal = 0
    let averageTimeToComplete = 0
    let lastBumpTime = 0

    for await (const { productId } of query) {

      while (nRunning >= concurrency) {
        await nextTick()
      }

      console.log('Starting import for', productId)

      nRunning++
      const startTime = Date.now()
      const p = processProduct(db, productId)
        .then(processSuccess.bind(null, productId))
        .catch(processError.bind(null, productId))
        .finally(() => {
          const endTime = Date.now()
          const deltaTime = endTime - startTime
          const deltaAverageTime = deltaTime - averageTimeToComplete
          const threshV = averageTimeToComplete * THROTTLE_THRESHOLD
          if (Date.now() - lastBumpTime > (concurrency * THROTTLE_DOWN_TIME_FACTOR) * averageTimeToComplete && deltaAverageTime > threshV) {
            lastBumpTime = Date.now()
            concurrency = Math.max(CONCURRENCY_GROWTH_MIN, concurrency - concurrency *  THROTTLE_DOWN_TIME_FACTOR)
            console.log('Slowdown detected, reducing concurrency', deltaAverageTime, threshV, averageTimeToComplete, concurrency)
          } else if (Date.now() - lastBumpTime > (concurrency * THROTTLE_UP_TIME_FACTOR) * averageTimeToComplete && deltaAverageTime > -threshV) {
            lastBumpTime = Date.now()
            concurrency += Math.max(CONCURRENCY_GROWTH_FACTOR / concurrency, CONCURRENCY_GROWTH_MIN)
            console.log('Speedup detected, increasing concurrency', deltaAverageTime, threshV, averageTimeToComplete, concurrency)
          }
          nTotal++
          averageTimeToComplete += deltaAverageTime / nTotal
          nRunning--
        })
      promises.push(p)
    }
    await Promise.all(promises)
    console.log('Finished import')
  } catch (err) {
    console.error('Retrying import due to error', err)
    try {
      await Promise.all(promises)
    } catch (promiseErr) {
      console.error('Could not finish waiting for all promises:', promiseErr)
    }
    await processAllProducts(db)
  }
}

const main = async () => {
  console.log('Starting search engine import')
  const db = new MyDB()
  try {
    await db.initialize({ context: {} })
    await searchEngine.init()
    await processAllProducts(db)
  } finally {
    await knex.destroy()
  }
}

main().catch(err => console.error(err)).finally(() => process.exit())

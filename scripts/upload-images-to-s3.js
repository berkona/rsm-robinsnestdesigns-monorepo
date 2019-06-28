
const AWS = require('aws-sdk')
const fetch = require('isomorphic-fetch')
const fs = require('fs')
const path = require('path')
const url = require('url')

if (!process.env.SQL_ENGINE || !process.env.SQL_HOST || !process.env.SQL_USER || !process.env.SQL_PWD || !process.env.SQL_DB) {
  throw new Error('You must set the environmental variables: SQL_ENGINE, SQL_HOST, SQL_USER, SQL_PWD, SQL_DB before starting server')
}

const knex = require('knex')({
  client: process.env.SQL_ENGINE,
  connection: {
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PWD,
    database: process.env.SQL_DB,
  },
})

AWS.config.update({ region: 'us-east-1' })

const s3 = new AWS.S3()

const BUCKET = 'public-images-static-af327.robinsnestdesigns.com'
const CDN_URL = 'https://public-images-static-af327.robinsnestdesigns.com/'
const SITE_PREFIX = 'https://www.robinsnestdesigns.com/ahpimages/'

let nInvalid = 0
let nSkipped = 0

const downloadUrl = async (url, file) => {
  const res = await fetch(url)
  await new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(file, { autoClose: true})
    res.body.pipe(fileStream)
    res.body.on("error", reject)
    fileStream.on("finish", resolve)
  })
}

const uploadUrl = (bucket, file) => new Promise((resolve, reject) => {
  // call S3 to retrieve upload file to specified bucket
  var uploadParams = { Bucket: bucket, Key: '', Body: ''};
  var fileStream = fs.createReadStream(file)
  fileStream.on('error', function(err) {
    // console.log('File Error', err)
    reject(err)
  })
  uploadParams.Body = fileStream
  uploadParams.Key = path.basename(file)

  // call S3 to retrieve upload file to specified bucket
  s3.upload(uploadParams, function (err, data) {
    if (err) {
      // console.log("Error", err);
      reject(err)
    } else if (data) {
      // console.log("Upload Success", data.Location);
      resolve(data.Location)
    }
  })
})

const processRow = async (row) => {
  console.log('Processing ID ' + row.ID)

  let imageUrl = null
  let urls = []
  if (row.Hyperlinked_Image)
    urls.push(row.Hyperlinked_Image)
  if (row.Image)
    urls.push(url.resolve(SITE_PREFIX, row.Image))
  if (row.Thumbnail)
    urls.push(url.resolve(SITE_PREFIX, row.Thumbnail))

  for (let j = 0 ; j < urls.length; j++) {
    let testUrl = urls[j]
    console.log('Checking url', testUrl)
    if (!testUrl) {
      console.log('testUrl was null, skipping')
      continue
    }

    if (testUrl.startsWith(CDN_URL)) {
      console.log('found CDN url, skipping item')
      nSkipped++
      break
    }

    if (testUrl.endsWith('/')) {
      console.log('testUrl was directory')
      continue
    }

    if (!testUrl.toLowerCase().endsWith('.png')
     && !testUrl.toLowerCase().endsWith('.gif')
     && !testUrl.toLowerCase().endsWith('.jpg')
     && !testUrl.toLowerCase().endsWith('.jpeg')) {
      console.log('testUrl was not a valid image')
      continue
    }

    for (let k = 0; k < 3; k++) {
      try {
        const res = await fetch(testUrl)
        if (res.ok) {
          imageUrl = testUrl
          break
        } else {
          console.warn('Could not fetch url', res.status)
        }
      } catch (err) {
        console.warn('Could not fetch url', err)
      }
    }
    if (imageUrl != null) break
  }

  if (imageUrl == null) {
    console.warn('No valid image for product id ' + row.ID)
    nInvalid++
    return
  }

  const parts = imageUrl.split('.')
  const ending = parts[parts.length-1]

  var file = 'image-' + Date.now() + '-' + parseInt((Math.random() * 10000000000000000000)).toString(36) + '.' + ending
  await downloadUrl(imageUrl, file)
  await uploadUrl(BUCKET, file)
  fs.unlinkSync(file)

  console.log('Uploaded to ', CDN_URL + file)
  await knex('Products').where('ID', row.ID).update({ Hyperlinked_Image: CDN_URL + file })
}

async function main() {
  const batchSize = 100
  let skip = 0
  let rows;

  do {
    rows = await knex.select(
        'ID',
        'Hyperlinked_Image',
        'Image',
        'Thumbnail'
      )
      .from('Products')
      .orderBy('ID', 'ASC')
      .offset(skip)
      .limit(batchSize)

    skip += batchSize

    await Promise.all(rows.map(processRow))
  } while (rows.length > 0)
  nInvalid = nInvalid - nSkipped
}

main().then(() => console.log('all images uploaded to s3: nInvalid={' + nInvalid + '} nSkipped={' + nSkipped + '}')).catch(err => console.error(err))

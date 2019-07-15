const aws = require('aws-sdk')

// Configure aws with your accessKeyId and your secretAccessKey
aws.config.update({
  region: 'us-east-1', // Put your aws region here
  accessKeyId: process.env.AWSAccessKeyId,
  secretAccessKey: process.env.AWSSecretKey
})

const S3_BUCKET = process.env.AWSUploadBucket

const signS3Url = async (fileName, fileType) => {
  if (!fileName || !fileType)
    throw new Error('fileName and fileType both required to sign url')

  const s3 = new aws.S3();  // Create a new instance of S3

// Set up the payload of what we are sending to the S3 api
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 500,
    ContentType: fileType,
    ACL: 'public-read'
  };
  // Make a request to the S3 API to get a signed URL which we can use to upload our file
  const data = await s3.getSignedUrl('putObject', s3Params);
  // Data payload of what we are sending back, the url of the signedRequest and a URL where we can access the content after its saved.
  const returnData = {
    signedUrl: data,
    publicUrl: `https://${S3_BUCKET}/${fileName}`
  };
  return returnData
}

module.exports = signS3Url

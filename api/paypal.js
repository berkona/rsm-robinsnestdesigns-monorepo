const paypal = require('@paypal/checkout-server-sdk');

// Creating an environment
if (!process.env.PAYPAL_CLIENTID || !process.env.PAYPAL_CLIENTSECRET)
  throw new Error('You must set the environmental variables: PAYPAL_CLIENTID and PAYPAL_CLIENTSECRET before starting server')

let clientId =  process.env.PAYPAL_CLIENTID
let clientSecret = process.env.PAYPAL_CLIENTSECRET
let environment = process.env.NODE_ENV == "production"
  ? new paypal.core.LiveEnvironment(clientId, clientSecret)
  : new paypal.core.SandboxEnvironment(clientId, clientSecret)
let client = new paypal.core.PayPalHttpClient(environment)

module.exports = client;

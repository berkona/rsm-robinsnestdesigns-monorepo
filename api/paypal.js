const paypal = require('@paypal/checkout-server-sdk');

// Creating an environment
let clientId =  process.env.PAYPAL_CLIENTID || 'EBWKjlELKMYqRNQ6sYvFo64FtaRLRR5BdHEESmha49TM'
let clientSecret = process.env.PAYPAL_CLIENTSECRET || 'EO422dn3gQLgDbuwqTjzrFgFtaRLRR5BdHEESmha49TM';
let environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
let client = new paypal.core.PayPalHttpClient(environment);

module.exports = client;

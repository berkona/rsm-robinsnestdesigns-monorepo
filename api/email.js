const mailgun = require('mailgun-js')

if (!process.env.MAILGUN_API_KEY) {
  throw new Error("MAILGUN_API_KEY must be set in env")
}

const DOMAIN = 'mg.robinsnestdesigns.com'

const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN })

module.exports = (data) => mg.messages().send(data)

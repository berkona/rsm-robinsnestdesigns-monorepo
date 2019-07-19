const jwt = require('jsonwebtoken')
const reduceUser = require('./reduceUser')

for (let s of [ 'JWT_SECRET', 'JWT_ISSUER' ]) {
  if (!process.env[s]) throw new Error(s + ' is required in the environment')
}

const JWT_SECRET = process.env.JWT_SECRET
const JWT_ISSUER = process.env.JWT_ISSUER
const JWT_MAX_AGE = process.env.JWT_MAX_AGE || '14d';

const admin_emails = [
    'jon@solipsisdev.com',
    'robin@robinsnestdesigns.com',
]

const generateAuthToken = (userId, isAdmin) => {
  return jwt.sign({ uid: userId, a: isAdmin === true }, JWT_SECRET, { algorithm: 'HS256', expiresIn: JWT_MAX_AGE, issuer: JWT_ISSUER });
}

const verifyAuthToken = (token) => {
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'], issuer: JWT_ISSUER, maxAge: JWT_MAX_AGE })
}

const register = (obj, args, context) => {
  return context.dataSources.db.tryUpsertUser(args.email, { Email: args.email, Password: args.password }).then(() => signin(obj, args, context))
}

const signin = (obj, args, context) => {
  return context.dataSources.db.findUser(args.email).then((user) => {
    if (!user) {
      return Promise.reject(new Error('User does not exist'));
    } else {
      // TODO upgrade password storage...
      if (args.password === user.Password) {
        user = reduceUser(user)
        const isAdmin = admin_emails.filter(email => user.email == email).length > 0 || false
        const token = generateAuthToken(user.id, isAdmin)
        return {
          token,
          user,
        }
      } else {
        return Promise.reject(new Error('Username or password does not match'));
      }
    }
  })
}

const getUserFromToken = async (token, db) => {
  const { uid } = verifyAuthToken(token)
  const userRow = await db.findUserById(uid)
  if (!userRow) throw new Error('user does not exist')
  const user = reduceUser(userRow)
  return user
}

module.exports = {
  generateAuthToken,
  verifyAuthToken,
  register,
  signin,
  getUserFromToken,
}

const jwt = require('jsonwebtoken')
const env = require('../config/env')
const { error } = require('../utils/response')

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Access denied. No token provided.', 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, env.jwt.secret)
    req.user = decoded
    next()
  } catch (err) {
    return error(res, 'Invalid or expired token.', 401)
  }
}

module.exports = authenticate
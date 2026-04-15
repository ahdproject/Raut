const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authRepository = require('./auth.repository')
const AUTH_MESSAGES = require('./auth.constants')
const env = require('../../config/env')

const login = async (email, password) => {
  const user = await authRepository.findUserByEmail(email)

  if (!user) {
    throw { statusCode: 401, message: AUTH_MESSAGES.INVALID_CREDENTIALS }
  }

  if (!user.is_active) {
    throw { statusCode: 403, message: AUTH_MESSAGES.ACCOUNT_INACTIVE }
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    throw { statusCode: 401, message: AUTH_MESSAGES.INVALID_CREDENTIALS }
  }

  await authRepository.updateLastLogin(user.id)

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }

  const token = jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  })

  return {
    token,
    user: payload,
  }
}

module.exports = { login }
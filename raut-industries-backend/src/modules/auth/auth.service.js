const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authRepository = require('./auth.repository')
const AUTH_MESSAGES = require('./auth.constants')
const env = require('../../config/env')
const logger = require('../../utils/logger')

const login = async (email, password) => {
  logger.info(`AUTH SERVICE - Finding user by email: ${email}`)
  
  const user = await authRepository.findUserByEmail(email)
  logger.info(`AUTH SERVICE - User lookup result:`, { found: !!user, userId: user?.id })

  if (!user) {
    logger.warn(`AUTH SERVICE - User not found: ${email}`)
    throw { statusCode: 401, message: AUTH_MESSAGES.INVALID_CREDENTIALS }
  }

  if (!user.is_active) {
    logger.warn(`AUTH SERVICE - Account inactive: ${email}`)
    throw { statusCode: 403, message: AUTH_MESSAGES.ACCOUNT_INACTIVE }
  }

  logger.info(`AUTH SERVICE - Comparing password for user: ${email}`)
  const isPasswordValid = await bcrypt.compare(password, user.password)
  logger.info(`AUTH SERVICE - Password validation result: ${isPasswordValid}`)

  if (!isPasswordValid) {
    logger.warn(`AUTH SERVICE - Invalid password for user: ${email}`)
    throw { statusCode: 401, message: AUTH_MESSAGES.INVALID_CREDENTIALS }
  }

  logger.info(`AUTH SERVICE - Updating last login for user: ${user.id}`)
  await authRepository.updateLastLogin(user.id)

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }

  logger.info(`AUTH SERVICE - Generating JWT token for user: ${user.id}`)
  const token = jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  })
  logger.info(`AUTH SERVICE - Token generated successfully`)

  return {
    token,
    user: payload,
  }
}

module.exports = { login }
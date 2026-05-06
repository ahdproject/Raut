const authService = require('./auth.service')
const { loginSchema } = require('./auth.validation')
const { success, error } = require('../../utils/response')
const AUTH_MESSAGES = require('./auth.constants')
const logger = require('../../utils/logger')

const login = async (req, res, next) => {
  try {
    logger.info('LOGIN REQUEST - Body received:', JSON.stringify(req.body))
    
    const { error: validationError } = loginSchema.validate(req.body)
    if (validationError) {
      logger.warn('LOGIN VALIDATION ERROR:', validationError.details[0].message)
      return error(res, validationError.details[0].message, 400)
    }

    const { email, password } = req.body
    logger.info(`LOGIN ATTEMPT - Email: ${email}`)
    
    const result = await authService.login(email, password)
    logger.info(`LOGIN SUCCESS - User ID: ${result.user.id}`)

    return success(res, result, AUTH_MESSAGES.LOGIN_SUCCESS)
  } catch (err) {
    logger.error('LOGIN ERROR - Exception caught:', {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      fullError: err
    })
    next(err)
  }
}

const getMe = async (req, res, next) => {
  try {
    return success(res, req.user, 'Authenticated user fetched')
  } catch (err) {
    next(err)
  }
}

module.exports = { login, getMe }
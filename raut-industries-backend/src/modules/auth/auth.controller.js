const authService = require('./auth.service')
const { loginSchema } = require('./auth.validation')
const { success, error } = require('../../utils/response')
const AUTH_MESSAGES = require('./auth.constants')

const login = async (req, res, next) => {
  try {
    const { error: validationError } = loginSchema.validate(req.body)
    if (validationError) {
      return error(res, validationError.details[0].message, 400)
    }

    const { email, password } = req.body
    const result = await authService.login(email, password)

    return success(res, result, AUTH_MESSAGES.LOGIN_SUCCESS)
  } catch (err) {
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
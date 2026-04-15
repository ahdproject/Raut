const usersService = require('./users.service')
const {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
} = require('./users.validation')
const { success, error } = require('../../utils/response')
const USER_MESSAGES = require('./users.constants')

const getAllUsers = async (req, res, next) => {
  try {
    const users = await usersService.getAllUsers()
    return success(res, users, USER_MESSAGES.FETCHED)
  } catch (err) {
    next(err)
  }
}

const getUserById = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.id)
    return success(res, user, USER_MESSAGES.SINGLE_FETCHED)
  } catch (err) {
    next(err)
  }
}

const createUser = async (req, res, next) => {
  try {
    const { error: validationError } = createUserSchema.validate(req.body)
    if (validationError) {
      return error(res, validationError.details[0].message, 400)
    }

    const user = await usersService.createUser(req.body)
    return success(res, user, USER_MESSAGES.CREATED, 201)
  } catch (err) {
    next(err)
  }
}

const updateUser = async (req, res, next) => {
  try {
    const { error: validationError } = updateUserSchema.validate(req.body)
    if (validationError) {
      return error(res, validationError.details[0].message, 400)
    }

    const user = await usersService.updateUser(req.params.id, req.body)
    return success(res, user, USER_MESSAGES.UPDATED)
  } catch (err) {
    next(err)
  }
}

const changePassword = async (req, res, next) => {
  try {
    const { error: validationError } = changePasswordSchema.validate(req.body)
    if (validationError) {
      return error(res, validationError.details[0].message, 400)
    }

    const { current_password, new_password } = req.body
    await usersService.changePassword(req.user.id, current_password, new_password)
    return success(res, {}, USER_MESSAGES.PASSWORD_CHANGED)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  changePassword,
}
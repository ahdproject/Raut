const bcrypt = require('bcryptjs')
const usersRepository = require('./users.repository')
const USER_MESSAGES = require('./users.constants')

const getAllUsers = async () => {
  return await usersRepository.findAll()
}

const getUserById = async (id) => {
  const user = await usersRepository.findById(id)
  if (!user) {
    throw { statusCode: 404, message: USER_MESSAGES.NOT_FOUND }
  }
  return user
}

const createUser = async ({ name, email, password, role }) => {
  const existing = await usersRepository.findByEmail(email)
  if (existing) {
    throw { statusCode: 409, message: USER_MESSAGES.EMAIL_EXISTS }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await usersRepository.create({
    name,
    email,
    hashedPassword,
    role,
  })

  return user
}

const updateUser = async (id, fields) => {
  const existing = await usersRepository.findById(id)
  if (!existing) {
    throw { statusCode: 404, message: USER_MESSAGES.NOT_FOUND }
  }

  const updated = await usersRepository.update(id, fields)
  return updated
}

const changePassword = async (id, currentPassword, newPassword) => {
  const existingHash = await usersRepository.getPasswordById(id)
  if (!existingHash) {
    throw { statusCode: 404, message: USER_MESSAGES.NOT_FOUND }
  }

  const isMatch = await bcrypt.compare(currentPassword, existingHash)
  if (!isMatch) {
    throw { statusCode: 400, message: USER_MESSAGES.WRONG_PASSWORD }
  }

  const newHash = await bcrypt.hash(newPassword, 10)
  await usersRepository.updatePassword(id, newHash)
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  changePassword,
}
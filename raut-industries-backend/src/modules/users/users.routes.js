const express = require('express')
const router = express.Router()
const usersController = require('./users.controller')
const authenticate = require('../../middlewares/auth.middleware')
const authorize = require('../../middlewares/role.middleware')
const ROLES = require('../../constants/roles')

// All routes require authentication
router.use(authenticate)

// Only SuperAdmin and Admin can manage users
router.get('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), usersController.getAllUsers)
router.get('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), usersController.getUserById)
router.post('/', authorize(ROLES.SUPER_ADMIN), usersController.createUser)
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), usersController.updateUser)

// Any logged-in user can change their own password
router.put('/change-password/me', usersController.changePassword)

module.exports = router

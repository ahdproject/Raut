const express = require('express')
const router = express.Router()
const employeesController = require('./employees.controller')
const authenticate = require('../../middlewares/auth.middleware')
const authorize = require('../../middlewares/role.middleware')
const ROLES = require('../../constants/roles')

router.use(authenticate)

// All roles can read employees
router.get('/', employeesController.getAllEmployees)
router.get('/:id', employeesController.getEmployeeById)

// Only Admin and SuperAdmin can create or update
router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  employeesController.createEmployee
)
router.put(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  employeesController.updateEmployee
)

module.exports = router
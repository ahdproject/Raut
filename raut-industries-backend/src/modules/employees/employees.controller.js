const employeesService = require('./employees.service')
const { createEmployeeSchema, updateEmployeeSchema } = require('./employees.validation')
const { success, error } = require('../../utils/response')
const { EMPLOYEE_MESSAGES } = require('./employees.constants')

const getAllEmployees = async (req, res, next) => {
  try {
    const search = req.query.search || ''
    const department = req.query.department || ''
    const activeOnly = req.query.active === 'true'
    const employees = await employeesService.getAllEmployees({
      search,
      department,
      activeOnly,
    })
    return success(res, employees, EMPLOYEE_MESSAGES.FETCHED)
  } catch (err) {
    next(err)
  }
}

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await employeesService.getEmployeeById(req.params.id)
    return success(res, employee, EMPLOYEE_MESSAGES.SINGLE_FETCHED)
  } catch (err) {
    next(err)
  }
}

const createEmployee = async (req, res, next) => {
  try {
    const { error: validationError } = createEmployeeSchema.validate(req.body)
    if (validationError) {
      return error(res, validationError.details[0].message, 400)
    }

    const employee = await employeesService.createEmployee(req.body)
    return success(res, employee, EMPLOYEE_MESSAGES.CREATED, 201)
  } catch (err) {
    next(err)
  }
}

const updateEmployee = async (req, res, next) => {
  try {
    const { error: validationError } = updateEmployeeSchema.validate(req.body)
    if (validationError) {
      return error(res, validationError.details[0].message, 400)
    }

    const employee = await employeesService.updateEmployee(req.params.id, req.body)
    return success(res, employee, EMPLOYEE_MESSAGES.UPDATED)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
}
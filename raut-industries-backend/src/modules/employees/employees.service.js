const employeesRepository = require('./employees.repository')
const { EMPLOYEE_MESSAGES } = require('./employees.constants')

const getAllEmployees = async ({ search = '', department = '', activeOnly = false } = {}) => {
  return await employeesRepository.findAll({ search, department, activeOnly })
}

const getEmployeeById = async (id) => {
  const employee = await employeesRepository.findById(id)
  if (!employee) {
    throw { statusCode: 404, message: EMPLOYEE_MESSAGES.NOT_FOUND }
  }
  return employee
}

const createEmployee = async (data) => {
  // Check duplicate emp_code
  const codeExists = await employeesRepository.findByEmpCode(data.emp_code)
  if (codeExists) {
    throw { statusCode: 409, message: EMPLOYEE_MESSAGES.EMP_CODE_EXISTS }
  }

  // Check duplicate phone if provided
  if (data.phone) {
    const phoneExists = await employeesRepository.findByPhone(data.phone)
    if (phoneExists) {
      throw { statusCode: 409, message: EMPLOYEE_MESSAGES.PHONE_EXISTS }
    }
  }

  return await employeesRepository.create(data)
}

const updateEmployee = async (id, fields) => {
  const existing = await employeesRepository.findById(id)
  if (!existing) {
    throw { statusCode: 404, message: EMPLOYEE_MESSAGES.NOT_FOUND }
  }

  // Check phone conflict if phone is being changed
  if (fields.phone && fields.phone !== existing.phone) {
    const phoneExists = await employeesRepository.findByPhone(fields.phone)
    if (phoneExists) {
      throw { statusCode: 409, message: EMPLOYEE_MESSAGES.PHONE_EXISTS }
    }
  }

  return await employeesRepository.update(id, fields)
}

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
}
const EMPLOYEE_MESSAGES = {
  CREATED: 'Employee created successfully',
  UPDATED: 'Employee updated successfully',
  FETCHED: 'Employees fetched successfully',
  SINGLE_FETCHED: 'Employee fetched successfully',
  NOT_FOUND: 'Employee not found',
  EMP_CODE_EXISTS: 'An employee with this code already exists',
  PHONE_EXISTS: 'An employee with this phone number already exists',
  CANNOT_DEACTIVATE: 'Cannot deactivate employee with future attendance records',
  INVALID_SALARY: 'Salary must be greater than or equal to zero',
}

const DEPARTMENTS = [
  'Production',
  'Processing',
  'QC',
  'Stores',
  'Admin',
  'Accounts',
  'Maintenance',
]

module.exports = { EMPLOYEE_MESSAGES, DEPARTMENTS }
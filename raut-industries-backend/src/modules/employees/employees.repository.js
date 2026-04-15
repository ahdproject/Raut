const pool = require('../../config/db')

const findAll = async ({ search = '', department = '', activeOnly = false }) => {
  const result = await pool.query(
    `SELECT
       id, emp_code, name, role, department,
       phone, joining_date, salary,
       is_active, created_at, updated_at
     FROM employees
     WHERE
       ($1 = false OR is_active = true)
       AND ($2 = '' OR LOWER(name) LIKE LOWER($3))
       AND ($4 = '' OR department = $4)
     ORDER BY emp_code ASC`,
    [activeOnly, search, `%${search}%`, department]
  )
  return result.rows
}

const findById = async (id) => {
  const result = await pool.query(
    `SELECT
       id, emp_code, name, role, department,
       phone, joining_date, salary,
       is_active, created_at, updated_at
     FROM employees
     WHERE id = $1`,
    [id]
  )
  return result.rows[0] || null
}

const findByEmpCode = async (empCode) => {
  const result = await pool.query(
    `SELECT id FROM employees WHERE LOWER(emp_code) = LOWER($1)`,
    [empCode]
  )
  return result.rows[0] || null
}

const findByPhone = async (phone) => {
  const result = await pool.query(
    `SELECT id FROM employees WHERE phone = $1`,
    [phone]
  )
  return result.rows[0] || null
}

const create = async ({
  emp_code, name, role, department,
  phone, joining_date, salary,
}) => {
  const result = await pool.query(
    `INSERT INTO employees
       (emp_code, name, role, department, phone, joining_date, salary)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING
       id, emp_code, name, role, department,
       phone, joining_date, salary, is_active, created_at`,
    [emp_code, name, role, department, phone || null, joining_date, salary]
  )
  return result.rows[0]
}

const update = async (id, fields) => {
  const {
    name, role, department, phone,
    joining_date, salary, is_active,
  } = fields

  const result = await pool.query(
    `UPDATE employees
     SET
       name         = COALESCE($1,  name),
       role         = COALESCE($2,  role),
       department   = COALESCE($3,  department),
       phone        = COALESCE($4,  phone),
       joining_date = COALESCE($5,  joining_date),
       salary       = COALESCE($6,  salary),
       is_active    = COALESCE($7,  is_active),
       updated_at   = NOW()
     WHERE id = $8
     RETURNING
       id, emp_code, name, role, department,
       phone, joining_date, salary, is_active, updated_at`,
    [name, role, department, phone, joining_date, salary, is_active, id]
  )
  return result.rows[0] || null
}

module.exports = {
  findAll,
  findById,
  findByEmpCode,
  findByPhone,
  create,
  update,
}
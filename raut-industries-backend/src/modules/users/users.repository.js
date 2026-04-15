const pool = require('../../config/db')

const findAll = async () => {
  const result = await pool.query(
    `SELECT id, name, email, role, is_active, last_login_at, created_at
     FROM users
     ORDER BY created_at DESC`
  )
  return result.rows
}

const findById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, email, role, is_active, last_login_at, created_at
     FROM users
     WHERE id = $1`,
    [id]
  )
  return result.rows[0] || null
}

const findByEmail = async (email) => {
  const result = await pool.query(
    `SELECT id, name, email, password, role, is_active
     FROM users
     WHERE email = $1`,
    [email]
  )
  return result.rows[0] || null
}

const create = async ({ name, email, hashedPassword, role }) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, is_active, created_at`,
    [name, email, hashedPassword, role]
  )
  return result.rows[0]
}

const update = async (id, fields) => {
  const { name, role, is_active } = fields

  const result = await pool.query(
    `UPDATE users
     SET
       name = COALESCE($1, name),
       role = COALESCE($2, role),
       is_active = COALESCE($3, is_active),
       updated_at = NOW()
     WHERE id = $4
     RETURNING id, name, email, role, is_active, updated_at`,
    [name, role, is_active, id]
  )
  return result.rows[0] || null
}

const updatePassword = async (id, hashedPassword) => {
  await pool.query(
    `UPDATE users
     SET password = $1, updated_at = NOW()
     WHERE id = $2`,
    [hashedPassword, id]
  )
}

const getPasswordById = async (id) => {
  const result = await pool.query(
    `SELECT password FROM users WHERE id = $1`,
    [id]
  )
  return result.rows[0]?.password || null
}

module.exports = {
  findAll,
  findById,
  findByEmail,
  create,
  update,
  updatePassword,
  getPasswordById,
}
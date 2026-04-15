const pool = require('../../config/db')

const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT id, name, email, password, role, is_active
     FROM users
     WHERE email = $1`,
    [email]
  )
  return result.rows[0] || null
}

const updateLastLogin = async (userId) => {
  await pool.query(
    `UPDATE users
     SET last_login_at = NOW()
     WHERE id = $1`,
    [userId]
  )
}

module.exports = {
  findUserByEmail,
  updateLastLogin,
}
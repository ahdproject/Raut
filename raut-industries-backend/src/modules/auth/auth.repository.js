const pool = require('../../config/db')
const logger = require('../../utils/logger')

const findUserByEmail = async (email) => {
  try {
    logger.info(`AUTH REPO - Executing query: SELECT user by email: ${email}`)
    const result = await pool.query(
      `SELECT id, name, email, password, role, is_active
       FROM users
       WHERE email = $1`,
      [email]
    )
    logger.info(`AUTH REPO - Query result: ${result.rows.length} row(s) found`)
    return result.rows[0] || null
  } catch (err) {
    logger.error(`AUTH REPO - Database error in findUserByEmail:`, {
      message: err.message,
      code: err.code,
      detail: err.detail
    })
    throw err
  }
}

const updateLastLogin = async (userId) => {
  try {
    logger.info(`AUTH REPO - Updating last_login for user: ${userId}`)
    await pool.query(
      `UPDATE users
       SET last_login_at = NOW()
       WHERE id = $1`,
      [userId]
    )
    logger.info(`AUTH REPO - Last login updated successfully for user: ${userId}`)
  } catch (err) {
    logger.error(`AUTH REPO - Database error in updateLastLogin:`, {
      message: err.message,
      code: err.code,
      detail: err.detail
    })
    throw err
  }
}

module.exports = {
  findUserByEmail,
  updateLastLogin,
}
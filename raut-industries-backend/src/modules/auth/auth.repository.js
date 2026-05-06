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
      detail: err.detail,
      hint: err.hint,
      severity: err.severity,
    })
    
    // Handle specific database errors
    if (err.code === 'ECONNREFUSED' || err.code === 'EHOSTUNREACH') {
      throw {
        statusCode: 503,
        message: 'Database connection failed. Please try again later.',
      }
    } else if (err.code === '42P01') {
      // Relation does not exist
      throw {
        statusCode: 500,
        message: 'Database schema error. Users table not found.',
      }
    } else if (err.code === '42703') {
      // Column does not exist
      throw {
        statusCode: 500,
        message: 'Database schema error. Invalid column reference.',
      }
    }
    
    throw {
      statusCode: 500,
      message: 'Database query failed',
    }
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
      detail: err.detail,
      hint: err.hint,
    })
    
    // Don't fail login if last_login update fails
    if (err.code === '42P01' || err.code === '42703') {
      logger.warn('AUTH REPO - Skipping last_login update due to schema error')
      return
    }
    
    throw {
      statusCode: 500,
      message: 'Database update failed',
    }
  }
}

module.exports = {
  findUserByEmail,
  updateLastLogin,
}
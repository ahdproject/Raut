const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  // Handle both Error objects and plain objects with statusCode/message
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'
  
  // Map specific database errors to user-friendly messages
  if (err.code === 'ECONNREFUSED') {
    statusCode = 503
    message = 'Database connection failed. Please try again later.'
  } else if (err.code === 'EHOSTUNREACH') {
    statusCode = 503
    message = 'Database server is unreachable. Please try again later.'
  } else if (err.code === '42P01') {
    // Relation does not exist
    statusCode = 500
    message = 'Database schema error. Please contact support.'
  } else if (err.code === '42703') {
    // Column does not exist
    statusCode = 500
    message = 'Database schema error. Please contact support.'
  } else if (err.code === 'ENOTFOUND') {
    statusCode = 503
    message = 'Unable to reach database server. Please try again later.'
  }
  
  // Detailed error logging for 5xx errors
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${message}`, {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      errorDetails: {
        message: err.message,
        code: err.code,
        detail: err.detail,
        hint: err.hint,
        stack: err.stack
      }
    })
  } else {
    // Simpler logging for client errors (4xx)
    logger.warn(`[${statusCode}] ${message} — ${req.method} ${req.originalUrl}`)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { statusCode, errorCode: err.code })
  })
}

module.exports = errorHandler
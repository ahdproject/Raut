const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  // Handle both Error objects and plain objects with statusCode/message
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  
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
    ...(process.env.NODE_ENV !== 'production' && { statusCode })
  })
}

module.exports = errorHandler
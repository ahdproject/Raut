const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  // Handle both Error objects and plain objects with statusCode/message
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  
  logger.error(`[${statusCode}] ${message} — ${req.method} ${req.originalUrl}`)

  res.status(statusCode).json({
    success: false,
    message,
  })
}

module.exports = errorHandler
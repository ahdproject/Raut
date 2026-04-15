require('dotenv').config()

module.exports = {
  port: process.env.PORT || 8000,
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    adminEmail: process.env.ADMIN_EMAIL,
    senderName: process.env.EMAIL_SENDER_NAME || 'Raut Industries',
  },
  nodeEnv: process.env.NODE_ENV || 'development',
  companyStateCode: process.env.COMPANY_STATE_CODE || '27',
}
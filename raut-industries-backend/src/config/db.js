const { Pool } = require('pg')
const env = require('./env')
const logger = require('../utils/logger')

// Create pool with support for both Railway DATABASE_URL and individual env vars
const createPool = () => {
  const isDatabaseUrlAvailable = !!process.env.DATABASE_URL
  
  logger.info('🔧 Database Configuration:')
  logger.info(`   Using DATABASE_URL: ${isDatabaseUrlAvailable ? 'Yes' : 'No'}`)
  
  let poolConfig
  
  if (isDatabaseUrlAvailable) {
    // Railway uses DATABASE_URL
    logger.info('   Connection method: DATABASE_URL (Railway)')
    poolConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required for Railway
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 20,
    }
  } else {
    // Local development uses individual variables
    logger.info('   Connection method: Individual env vars (Local)')
    logger.info(`   Host: ${env.db.host || 'NOT SET'}`)
    logger.info(`   Port: ${env.db.port || 'NOT SET'}`)
    logger.info(`   Database: ${env.db.name || 'NOT SET'}`)
    logger.info(`   User: ${env.db.user || 'NOT SET'}`)
    
    poolConfig = {
      host: env.db.host,
      port: env.db.port,
      database: env.db.name,
      user: env.db.user,
      password: env.db.password,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: 20,
    }
  }
  
  return new Pool(poolConfig)
}

const pool = createPool()

pool.on('connect', () => {
  logger.info('✅ PostgreSQL connected successfully')
})

pool.on('error', (err) => {
  logger.error('❌ PostgreSQL pool error:', {
    message: err.message,
    code: err.code,
    detail: err.detail,
  })
})

module.exports = pool
const { Pool } = require('pg')
const env = require('./env')
const logger = require('../utils/logger')

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
})

pool.on('connect', () => {
  logger.info('PostgreSQL connected')
})

pool.on('error', (err) => {
  logger.error('PostgreSQL error:', err)
})

module.exports = pool
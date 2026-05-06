const app = require('./src/app')
const env = require('./src/config/env')
const logger = require('./src/utils/logger')

logger.info('='.repeat(60))
logger.info('STARTING RAUT INDUSTRIES SERVER')
logger.info('='.repeat(60))
logger.info('Environment:', {
  nodeEnv: env.nodeEnv,
  port: env.port,
  dbHost: env.db.host,
  dbName: env.db.name,
  jwtSecretConfigured: !!env.jwt.secret,
  jwtExpiresIn: env.jwt.expiresIn,
})

app.listen(env.port, () => {
  logger.info(`✅ Raut Industries server running on port ${env.port}`)
  logger.info('Ready to accept connections')
  logger.info('='.repeat(60))
})
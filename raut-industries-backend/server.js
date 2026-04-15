const app = require('./src/app')
const env = require('./src/config/env')
const logger = require('./src/utils/logger')

app.listen(env.port, () => {
  logger.info(`Raut Industries server running on port ${env.port}`)
})
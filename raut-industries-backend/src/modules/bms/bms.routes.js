const express      = require('express')
const router       = express.Router()
const ctrl         = require('./bms.controller')
const authenticate = require('../../middlewares/auth.middleware')

// Authenticate all BMS routes
router.use(authenticate)

// POST /api/bms/send-bill — send Raut bill via BMS email + template
router.post('/send-bill', ctrl.sendBillViaBMS)

// Fallback: catch all other routes and proxy to BMS
router.use(ctrl.proxy)

module.exports = router
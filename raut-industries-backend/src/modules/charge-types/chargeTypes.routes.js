const express = require('express')
const router = express.Router()
const chargeTypesController = require('./chargeTypes.controller')
const authenticate = require('../../middlewares/auth.middleware')
const authorize = require('../../middlewares/role.middleware')
const ROLES = require('../../constants/roles')

router.use(authenticate)

// All roles can read charge types (needed when creating bills)
router.get('/', chargeTypesController.getAllChargeTypes)
router.get('/:id', chargeTypesController.getChargeTypeById)

// Only SuperAdmin and Admin can create or update
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), chargeTypesController.createChargeType)
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), chargeTypesController.updateChargeType)

module.exports = router
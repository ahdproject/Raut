const express = require('express')
const router = express.Router()
const gstSlabsController = require('./gstSlabs.controller')
const authenticate = require('../../middlewares/auth.middleware')
const authorize = require('../../middlewares/role.middleware')
const ROLES = require('../../constants/roles')

router.use(authenticate)

// All roles can read GST slabs (needed when creating bills)
router.get('/', gstSlabsController.getAllGstSlabs)
router.get('/:id', gstSlabsController.getGstSlabById)

// Only SuperAdmin and Admin can create or update
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), gstSlabsController.createGstSlab)
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), gstSlabsController.updateGstSlab)

module.exports = router
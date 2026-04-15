const express = require('express')
const router = express.Router()
const clientsController = require('./clients.controller')
const authenticate = require('../../middlewares/auth.middleware')
const authorize = require('../../middlewares/role.middleware')
const ROLES = require('../../constants/roles')

router.use(authenticate)

// All roles can read clients (needed when creating bills)
router.get('/', clientsController.getAllClients)
router.get('/:id', clientsController.getClientById)

// Only SuperAdmin and Admin can create or update clients
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), clientsController.createClient)
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), clientsController.updateClient)

module.exports = router

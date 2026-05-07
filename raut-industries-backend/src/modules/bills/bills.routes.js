const express = require('express')
const router = express.Router()
const billsController = require('./bills.controller')
const authenticate = require('../../middlewares/auth.middleware')
const authorize = require('../../middlewares/role.middleware')
const ROLES = require('../../constants/roles')

router.use(authenticate)

// Utility routes
router.get('/next-number', billsController.getNextBillNumber)
router.post('/preview', billsController.previewBill)
router.post('/test-email', billsController.sendTestEmail)
router.post('/send-email', billsController.sendBillViaEmail)

// CRUD
router.get('/', billsController.getAllBills)
router.get('/:id', billsController.getBillById)

// Manager, Admin, SuperAdmin can create and update drafts
router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER),
  billsController.createBill
)
router.put(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER),
  billsController.updateBill
)

// Confirm — Manager and above
router.put(
  '/:id/confirm',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER),
  billsController.confirmBill
)

// Cancel — Admin and SuperAdmin only (enforced in controller too)
router.put(
  '/:id/cancel',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  billsController.cancelBill
)

module.exports = router

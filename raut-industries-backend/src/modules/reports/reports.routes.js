const express = require('express')
const router = express.Router()
const reportsController = require('./reports.controller')
const authenticate = require('../../middlewares/auth.middleware')
const authorize = require('../../middlewares/role.middleware')
const ROLES = require('../../constants/roles')

router.use(authenticate)

// Dashboard — all roles can access
router.get(
  '/dashboard',
  reportsController.getDashboardSummary
)

// P&L — Admin and SuperAdmin only
router.get(
  '/pnl',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  reportsController.getProfitAndLoss
)

// GST Reconciliation — Admin and SuperAdmin only
router.get(
  '/gst',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  reportsController.getGstReconciliation
)

// Sales Summary — all roles
router.get(
  '/sales',
  reportsController.getSalesSummary
)

// Attendance Report — all roles
router.get(
  '/attendance',
  reportsController.getAttendanceReport
)

module.exports = router
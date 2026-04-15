const express = require('express')
const router = express.Router()
const attendanceController = require('./attendance.controller')
const authenticate = require('../../middlewares/auth.middleware')
const authorize = require('../../middlewares/role.middleware')
const ROLES = require('../../constants/roles')

router.use(authenticate)

// ─── Read routes — all roles ──────────────────────────────────

// Monthly grid: GET /api/attendance?month=12&year=2025
router.get('/', attendanceController.getMonthlyAttendance)

// Monthly summary with payroll: GET /api/attendance/summary?month=12&year=2025
router.get('/summary', attendanceController.getMonthlySummary)

// Daily attendance: GET /api/attendance/daily/2025-12-04
router.get('/daily/:date', attendanceController.getDailyAttendance)

// Single employee monthly: GET /api/attendance/employee/:id?month=12&year=2025
router.get('/employee/:id', attendanceController.getEmployeeMonthlyAttendance)

// ─── Write routes — Manager and above ────────────────────────

// Mark single: POST /api/attendance
router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER),
  attendanceController.markAttendance
)

// Bulk mark: POST /api/attendance/bulk
router.post(
  '/bulk',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER),
  attendanceController.bulkMarkAttendance
)

// Update single: PUT /api/attendance/:id
router.put(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER),
  attendanceController.updateAttendance
)

module.exports = router

const attendanceRepository = require('./attendance.repository')
const employeesRepository = require('../employees/employees.repository')
const {
  ATTENDANCE_MESSAGES,
  STATUS_WEIGHT,
} = require('./attendance.constants')

// ─── Helpers ──────────────────────────────────────────────────

const isFutureDate = (dateStr) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const input = new Date(dateStr)
  return input > today
}

const computePayrollFields = (summary) => {
  const presentCount  = parseInt(summary.present_count)  || 0
  const absentCount   = parseInt(summary.absent_count)   || 0
  const halfDayCount  = parseInt(summary.half_day_count) || 0
  const leaveCount    = parseInt(summary.leave_count)    || 0
  const salary        = parseFloat(summary.salary)       || 0

  // Effective working days
  const effectiveDays =
    presentCount * STATUS_WEIGHT.present +
    halfDayCount * STATUS_WEIGHT.half_day +
    leaveCount   * STATUS_WEIGHT.leave

  // Total marked days (used as denominator for per-day salary)
  const totalMarkedDays = presentCount + absentCount + halfDayCount + leaveCount

  // Per day salary = monthly salary / total marked days in month
  // Guard against division by zero
  const perDaySalary = totalMarkedDays > 0
    ? parseFloat((salary / totalMarkedDays).toFixed(2))
    : 0

  const payableSalary = parseFloat((effectiveDays * perDaySalary).toFixed(2))

  return {
    present_count:   presentCount,
    absent_count:    absentCount,
    half_day_count:  halfDayCount,
    leave_count:     leaveCount,
    total_marked_days: totalMarkedDays,
    effective_days:  parseFloat(effectiveDays.toFixed(1)),
    per_day_salary:  perDaySalary,
    payable_salary:  payableSalary,
    monthly_salary:  salary,
  }
}

// ─── Mark single attendance ───────────────────────────────────

const markAttendance = async ({ employee_id, date, status, notes }, markedBy) => {
  // Validate employee exists
  const employee = await employeesRepository.findById(employee_id)
  if (!employee || !employee.is_active) {
    throw { statusCode: 404, message: ATTENDANCE_MESSAGES.EMPLOYEE_NOT_FOUND }
  }

  // Prevent future date
  if (isFutureDate(date)) {
    throw { statusCode: 400, message: ATTENDANCE_MESSAGES.FUTURE_DATE }
  }

  const id = await attendanceRepository.upsert({
    employee_id,
    date,
    status,
    notes,
    marked_by: markedBy,
  })

  return await attendanceRepository.findById(id)
}

// ─── Bulk mark attendance for a date ─────────────────────────

const bulkMarkAttendance = async ({ date, records }, markedBy) => {
  // Prevent future date
  if (isFutureDate(date)) {
    throw { statusCode: 400, message: ATTENDANCE_MESSAGES.FUTURE_DATE }
  }

  // Validate all employee IDs
  for (const record of records) {
    const employee = await employeesRepository.findById(record.employee_id)
    if (!employee || !employee.is_active) {
      throw {
        statusCode: 404,
        message: `${ATTENDANCE_MESSAGES.EMPLOYEE_NOT_FOUND}: ${record.employee_id}`,
      }
    }
  }

  await attendanceRepository.bulkUpsert(date, records, markedBy)

  // Return the day's full attendance after saving
  return await attendanceRepository.findByDate(date)
}

// ─── Update existing attendance record ───────────────────────

const updateAttendance = async (id, { status, notes }, markedBy) => {
  const existing = await attendanceRepository.findById(id)
  if (!existing) {
    throw { statusCode: 404, message: ATTENDANCE_MESSAGES.NOT_FOUND }
  }

  await attendanceRepository.update(id, { status, notes, marked_by: markedBy })
  return await attendanceRepository.findById(id)
}

// ─── Get attendance for a month (raw grid data) ──────────────

const getMonthlyAttendance = async ({ month, year, employeeId, department }) => {
  return await attendanceRepository.findByMonth({
    month,
    year,
    employeeId: employeeId || null,
    department: department || null,
  })
}

// ─── Get monthly summary with payroll fields ─────────────────

const getMonthlySummary = async ({ month, year, department }) => {
  const rows = await attendanceRepository.getMonthlySummary({
    month,
    year,
    department: department || null,
  })

  // Attach computed payroll fields to each row
  return rows.map((row) => ({
    employee_id:   row.employee_id,
    emp_code:      row.emp_code,
    employee_name: row.employee_name,
    role:          row.role,
    department:    row.department,
    ...computePayrollFields(row),
  }))
}

// ─── Get daily attendance for a date ─────────────────────────

const getDailyAttendance = async (date) => {
  return await attendanceRepository.findByDate(date)
}

// ─── Get attendance for a single employee in a month ─────────

const getEmployeeMonthlyAttendance = async (employeeId, month, year) => {
  const employee = await employeesRepository.findById(employeeId)
  if (!employee) {
    throw { statusCode: 404, message: ATTENDANCE_MESSAGES.EMPLOYEE_NOT_FOUND }
  }

  const records = await attendanceRepository.findByMonth({
    month,
    year,
    employeeId,
  })

  const summaryRows = await attendanceRepository.getMonthlySummary({
    month,
    year,
  })

  const summaryRow = summaryRows.find(
    (r) => r.employee_id === employeeId
  )

  const payroll = summaryRow ? computePayrollFields(summaryRow) : null

  return {
    employee,
    records,
    summary: payroll,
  }
}

module.exports = {
  markAttendance,
  bulkMarkAttendance,
  updateAttendance,
  getMonthlyAttendance,
  getMonthlySummary,
  getDailyAttendance,
  getEmployeeMonthlyAttendance,
}
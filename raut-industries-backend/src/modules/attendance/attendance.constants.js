const ATTENDANCE_MESSAGES = {
  MARKED: 'Attendance marked successfully',
  UPDATED: 'Attendance updated successfully',
  BULK_MARKED: 'Bulk attendance marked successfully',
  FETCHED: 'Attendance fetched successfully',
  SUMMARY_FETCHED: 'Attendance summary fetched successfully',
  NOT_FOUND: 'Attendance record not found',
  EMPLOYEE_NOT_FOUND: 'Employee not found or inactive',
  INVALID_DATE: 'Date must be a valid date (YYYY-MM-DD)',
  INVALID_STATUS: 'Status must be one of: present, absent, half_day, leave',
  FUTURE_DATE: 'Attendance cannot be marked for a future date',
}

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  HALF_DAY: 'half_day',
  LEAVE: 'leave',
}

// Half day counts as 0.5 for payroll purposes
const STATUS_WEIGHT = {
  present: 1,
  absent: 0,
  half_day: 0.5,
  leave: 0,
}

module.exports = {
  ATTENDANCE_MESSAGES,
  ATTENDANCE_STATUS,
  STATUS_WEIGHT,
}
const attendanceService = require('./attendance.service')
const { success } = require('../../utils/response')

exports.getMonthlyAttendance = async (req, res, next) => {
  try {
    const { month, year } = req.query
    const attendance = await attendanceService.getMonthlyAttendance({
      month: parseInt(month, 10),
      year: parseInt(year, 10)
    })
    success(res, attendance, 'Monthly attendance fetched', 200)
  } catch (error) {
    next(error)
  }
}

exports.getMonthlySummary = async (req, res, next) => {
  try {
    const { month, year } = req.query
    const summaries = await attendanceService.getMonthlySummary({
      month: parseInt(month, 10),
      year: parseInt(year, 10)
    })
    success(res, summaries, 'Monthly summary fetched', 200)
  } catch (error) {
    next(error)
  }
}

exports.getDailyAttendance = async (req, res, next) => {
  try {
    const { date } = req.params
    const records = await attendanceService.getDailyAttendance({ date })
    success(res, records, 'Daily attendance fetched', 200)
  } catch (error) {
    next(error)
  }
}

exports.getEmployeeMonthlyAttendance = async (req, res, next) => {
  try {
    const { id } = req.params
    const { month, year } = req.query
    const attendance = await attendanceService.getEmployeeMonthlyAttendance({
      employeeId: id,
      month: parseInt(month, 10),
      year: parseInt(year, 10)
    })
    success(res, attendance, 'Employee monthly attendance fetched', 200)
  } catch (error) {
    next(error)
  }
}

exports.upsertDailyAttendance = async (req, res, next) => {
  try {
    const { date } = req.params
    const { attendanceRecords } = req.body
    await attendanceService.upsertDailyAttendance({
      date,
      attendanceRecords,
      updatedBy: req.user.id
    })
    success(res, null, 'Daily attendance saved', 200)
  } catch (error) {
    next(error)
  }
}

exports.markAttendance = async (req, res, next) => {
  try {
    const record = await attendanceService.markAttendance({
      ...req.body,
      createdBy: req.user.id
    })
    success(res, record, 'Attendance marked', 201)
  } catch (error) {
    next(error)
  }
}

exports.bulkMarkAttendance = async (req, res, next) => {
  try {
    const { date, records } = req.body;
    
    // The frontend sends `{ date, records }`
    // We can directly call the service.
    
    if (!records || !Array.isArray(records)) {
       return res.status(400).json({ success: false, message: 'Invalid payload: records array is required' });
    }

    const result = await attendanceService.bulkMarkAttendance(
      { date, records },
      req.user.id
    );
    
    success(res, result, 'Bulk attendance marked', 201)
  } catch (error) {
    next(error)
  }
}

exports.updateAttendance = async (req, res, next) => {
  res.status(200).json({ message: "Not implemented" });
}

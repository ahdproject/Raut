const reportsService = require('./reports.service')
const { success, error } = require('../../utils/response')
const REPORT_MESSAGES = require('./reports.constants')

// ─── Shared query extractor ───────────────────────────────────

const extractMonthYear = (query) => {
  const { month, year } = query
  if (!month) return { err: 'Month is required' }
  if (!year)  return { err: 'Year is required'  }
  return { month, year }
}

// ─── P&L ─────────────────────────────────────────────────────

const getProfitAndLoss = async (req, res, next) => {
  try {
    const { month, year, err } = extractMonthYear(req.query)
    if (err) return error(res, err, 400)

    const report = await reportsService.getProfitAndLoss(month, year)
    return success(res, report, REPORT_MESSAGES.PNL_FETCHED)
  } catch (err) {
    next(err)
  }
}

// ─── GST Reconciliation ───────────────────────────────────────

const getGstReconciliation = async (req, res, next) => {
  try {
    const { month, year, err } = extractMonthYear(req.query)
    if (err) return error(res, err, 400)

    const report = await reportsService.getGstReconciliation(month, year)
    return success(res, report, REPORT_MESSAGES.GST_FETCHED)
  } catch (err) {
    next(err)
  }
}

// ─── Sales Summary ────────────────────────────────────────────

const getSalesSummary = async (req, res, next) => {
  try {
    const { month, year, err } = extractMonthYear(req.query)
    if (err) return error(res, err, 400)

    const report = await reportsService.getSalesSummaryReport(month, year)
    return success(res, report, REPORT_MESSAGES.SALES_FETCHED)
  } catch (err) {
    next(err)
  }
}

// ─── Attendance Report ────────────────────────────────────────

const getAttendanceReport = async (req, res, next) => {
  try {
    const { month, year, err } = extractMonthYear(req.query)
    if (err) return error(res, err, 400)

    const report = await reportsService.getAttendanceReport(month, year)
    return success(res, report, REPORT_MESSAGES.ATTENDANCE_FETCHED)
  } catch (err) {
    next(err)
  }
}

// ─── Dashboard Summary ────────────────────────────────────────

const getDashboardSummary = async (req, res, next) => {
  try {
    const { month, year, err } = extractMonthYear(req.query)
    if (err) return error(res, err, 400)

    const summary = await reportsService.getDashboardSummary(month, year)
    return success(res, summary, REPORT_MESSAGES.FETCHED)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getProfitAndLoss,
  getGstReconciliation,
  getSalesSummary,
  getAttendanceReport,
  getDashboardSummary,
}
const reportsService = require('./reports.service')
const { success, error } = require('../../utils/response')
const REPORT_MESSAGES = require('./reports.constants')
const emailService = require('../../utils/emailService')

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

// ─── Send Report via Email ────────────────────────────────────

const sendReportViaEmail = async (req, res, next) => {
  try {
    const { recipientEmail, reportType, month, year } = req.body

    // Validate inputs
    if (!recipientEmail) {
      return error(res, 'Recipient email is required', 400)
    }
    if (!reportType) {
      return error(res, 'Report type is required', 400)
    }
    if (!month || !year) {
      return error(res, 'Month and year are required', 400)
    }

    // Fetch report data based on type
    let reportData
    let reportName
    switch (reportType) {
      case 'pnl':
        reportData = await reportsService.getProfitAndLoss(month, year)
        reportName = `Profit & Loss Report - ${month}/${year}`
        break
      case 'gst':
        reportData = await reportsService.getGstReconciliation(month, year)
        reportName = `GST Reconciliation Report - ${month}/${year}`
        break
      case 'sales':
        reportData = await reportsService.getSalesSummaryReport(month, year)
        reportName = `Sales Summary Report - ${month}/${year}`
        break
      case 'attendance':
        reportData = await reportsService.getAttendanceReport(month, year)
        reportName = `Attendance Report - ${month}/${year}`
        break
      default:
        return error(res, 'Invalid report type', 400)
    }

    // Send email with report
    await reportsService.sendReportViaEmail({
      recipientEmail,
      reportName,
      reportType,
      reportData,
    })

    return success(res, { sent: true }, 'Report sent successfully via email')
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
  sendReportViaEmail,
}
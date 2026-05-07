const billsService = require('./bills.service')
const {
  createBillSchema,
  updateBillSchema,
  previewBillSchema,
} = require('./bills.validation')
const { success, error } = require('../../utils/response')
const { BILL_MESSAGES } = require('./bills.constants')
const ROLES = require('../../constants/roles')
const emailService = require('../../utils/emailService')

const getNextBillNumber = async (req, res, next) => {
  try {
    const nextNo = await billsService.getNextBillNumber()
    return success(res, { next_bill_no: nextNo }, BILL_MESSAGES.NEXT_NUMBER_FETCHED)
  } catch (err) {
    next(err)
  }
}

const previewBill = async (req, res, next) => {
  try {
    const { error: validationError } = previewBillSchema.validate(req.body)
    if (validationError) {
      return error(res, validationError.details[0].message, 400)
    }

    const preview = await billsService.previewBill(req.body)
    return success(res, preview, BILL_MESSAGES.PREVIEW_SUCCESS)
  } catch (err) {
    next(err)
  }
}

const getAllBills = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search || '',
      status: req.query.status || '',
      month: req.query.month ? parseInt(req.query.month) : null,
      year: req.query.year ? parseInt(req.query.year) : null,
      clientId: req.query.client_id || '',
    }
    const bills = await billsService.getAllBills(filters)
    return success(res, bills, BILL_MESSAGES.FETCHED)
  } catch (err) {
    next(err)
  }
}

const getBillById = async (req, res, next) => {
  try {
    const bill = await billsService.getBillById(req.params.id)
    return success(res, bill, BILL_MESSAGES.SINGLE_FETCHED)
  } catch (err) {
    next(err)
  }
}

const createBill = async (req, res, next) => {
  try {
    const { error: validationError } = createBillSchema.validate(req.body)
    if (validationError) {
      return error(res, validationError.details[0].message, 400)
    }

    const bill = await billsService.createBill(req.body, req.user.id)
    return success(res, bill, BILL_MESSAGES.CREATED, 201)
  } catch (err) {
    next(err)
  }
}

const updateBill = async (req, res, next) => {
  try {
    const { error: validationError } = updateBillSchema.validate(req.body)
    if (validationError) {
      return error(res, validationError.details[0].message, 400)
    }

    const bill = await billsService.updateBill(req.params.id, req.body)
    return success(res, bill, BILL_MESSAGES.UPDATED)
  } catch (err) {
    next(err)
  }
}

const confirmBill = async (req, res, next) => {
  try {
    const result = await billsService.confirmBill(req.params.id)
    return success(res, result, BILL_MESSAGES.CONFIRMED)
  } catch (err) {
    next(err)
  }
}

const cancelBill = async (req, res, next) => {
  try {
    // Only Admin / SuperAdmin can cancel
    if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.user.role)) {
      return error(res, BILL_MESSAGES.ONLY_ADMIN_CANCEL, 403)
    }

    const result = await billsService.cancelBill(req.params.id)
    return success(res, result, BILL_MESSAGES.CANCELLED)
  } catch (err) {
    next(err)
  }
}

const sendTestEmail = async (req, res, next) => {
  try {
    // Only Admin / SuperAdmin can test email
    if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.user.role)) {
      return error(res, 'Only Admin or SuperAdmin can test email', 403)
    }

    // Extract email from request body
    const { email } = req.body

    // Validate email
    if (!email) {
      return error(res, 'Email is required', 400)
    }

    // Send test email using emailService
    const emailSent = await emailService.sendTestEmail(email)

    if (emailSent) {
      return success(res, { sent: true }, 'Test email sent successfully')
    } else {
      return error(res, 'Failed to send test email. Please check email configuration.', 500)
    }
  } catch (err) {
    next(err)
  }
}

const sendBillViaEmail = async (req, res, next) => {
  try {
    const { billId, recipientEmail } = req.body

    // Validate inputs
    if (!billId) {
      return error(res, 'Bill ID is required', 400)
    }
    if (!recipientEmail) {
      return error(res, 'Recipient email is required', 400)
    }

    // Fetch bill details
    const bill = await billsService.getBillById(billId)
    if (!bill) {
      return error(res, BILL_MESSAGES.NOT_FOUND, 404)
    }

    // Send bill via email
    const sent = await billsService.sendBillViaEmail(bill, recipientEmail)

    if (sent) {
      return success(res, { sent: true }, 'Bill sent successfully via email')
    } else {
      return error(res, 'Failed to send bill via email', 500)
    }
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getNextBillNumber,
  previewBill,
  getAllBills,
  getBillById,
  createBill,
  updateBill,
  confirmBill,
  cancelBill,
  sendTestEmail,
  sendBillViaEmail,
}
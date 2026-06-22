const bmsService = require('./bms.service')

const handle = async (res, fn) => {
  try {
    const data = await fn()
    return res.json({ success: true, data })
  } catch (err) {
    console.error('=== BMS ERROR ===')
    console.error('Message:', err.message)
    if (err.response) {
      console.error('HTTP   :', err.response.status)
      console.error('URL    :', err.config?.url)
      console.error('Body   :', JSON.stringify(err.response.data))
    }
    console.error('=================')
    if (err.response) return res.status(err.response.status).json({ success: false, message: err.response.data?.message || 'BMS error', bmsError: err.response.data })
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message })
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' })
  }
}

const getInvoices     = (req, res) => handle(res, () => bmsService.getInvoices(req.query))
const getInvoiceById  = (req, res) => handle(res, () => bmsService.getInvoiceById(req.params.id))
const createInvoice   = (req, res) => handle(res, () => bmsService.createInvoice(req.body))
const sendInvoice     = (req, res) => handle(res, () => bmsService.sendInvoice(req.params.id, req.body))
const createPayment   = (req, res) => handle(res, () => bmsService.createPayment(req.body))
const getPaymentModes = (req, res) => handle(res, () => bmsService.getPaymentModes())

const downloadInvoicePdf = async (req, res) => {
  try {
    const bmsRes = await bmsService.downloadInvoicePdf(req.params.id)
    res.set('Content-Type', 'application/pdf')
    res.send(Buffer.from(bmsRes.data))
  } catch (err) {
    console.error('PDF download error:', err.response?.data || err.message)
    res.status(err.response?.status || 500).json({ success: false, message: 'Failed to download PDF' })
  }
}

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  sendInvoice,
  downloadInvoicePdf,
  createPayment,
  getPaymentModes,
}
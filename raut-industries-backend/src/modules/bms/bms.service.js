const axios  = require('axios')
const pool   = require('../../config/db')
const logger = require('../../utils/logger')

const BMS_BASE_URL = process.env.BMS_BASE_URL || 'https://app.octabms.com/api/v1'
const BMS_API_KEY  = process.env.BMS_API_KEY
const BMS_EMAIL    = process.env.BMS_EMAIL    || 'admin@rautindustries.com'
const BMS_PASSWORD = process.env.BMS_PASSWORD

// ── Token cache ───────────────────────────────────────────────
let _token = null, _tokenFetchedAt = null
const TOKEN_TTL_MS = 6 * 60 * 60 * 1000

const getBearerToken = async (forceRefresh = false) => {
  const now = Date.now()
  if (!forceRefresh && _token && _tokenFetchedAt && now - _tokenFetchedAt < TOKEN_TTL_MS) return _token
  if (!BMS_EMAIL || !BMS_PASSWORD) throw new Error('BMS_EMAIL and BMS_PASSWORD must be set in env')
  logger.info(`BMS: logging in as ${BMS_EMAIL}...`)
  const res = await axios.post(`${BMS_BASE_URL}/auth/login`, { email: BMS_EMAIL, password: BMS_PASSWORD })
  const token = res.data?.data?.access_token || res.data?.data?.token || res.data?.token || res.data?.access_token
  if (!token) throw new Error(`BMS login ok but no token found. Response: ${JSON.stringify(res.data)}`)
  _token = token; _tokenFetchedAt = now
  logger.info('BMS: token obtained')
  return token
}

const bmsRequest = async (method, path, { params, body } = {}) => {
  // Try X-API-Key first
  if (BMS_API_KEY) {
    try {
      const res = await axios.request({
        method, url: `${BMS_BASE_URL}${path}`,
        headers: { 'X-API-Key': BMS_API_KEY, 'Content-Type': 'application/json' },
        params, data: body,
      })
      return res.data
    } catch (err) {
      if (err.response?.status !== 401) throw err
      logger.warn(`BMS X-API-Key rejected on ${path} → falling back to login`)
    }
  }
  // Fall back to Bearer token
  const doBearer = async (forceRefresh = false) => {
    const token = await getBearerToken(forceRefresh)
    return axios.request({
      method, url: `${BMS_BASE_URL}${path}`,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      params, data: body,
    })
  }
  try {
    const res = await doBearer()
    return res.data
  } catch (err) {
    if (err.response?.status === 401) { const res = await doBearer(true); return res.data }
    throw err
  }
}

// ── Public API ────────────────────────────────────────────────

const getInvoices = async (q = {}) => {
  const params = { page: 1, ...q }
  if (params.limit) params.limit = Math.min(Number(params.limit), 100)
  try {
    return await bmsRequest('GET', '/invoices', { params })
  } catch (err) {
    if (err.response?.status === 403) {
      logger.warn('BMS invoices 403: plan restriction')
      return { success: false, planRestricted: true, data: [],
        message: 'Invoice API not available on current BMS plan. Upgrade at app.octabms.com.' }
    }
    throw err
  }
}

const getInvoiceById = async (id) =>
  bmsRequest('GET', `/invoices/${id}`)

const createInvoice = async (body) =>
  bmsRequest('POST', '/invoices', { body })

const sendInvoice = async (id, body) =>
  bmsRequest('POST', `/invoices/${id}/send`, { body })

const downloadInvoicePdf = async (id) => {
  const token = await getBearerToken()
  return axios.get(`${BMS_BASE_URL}/invoices/${id}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'arraybuffer',
  })
}

const createPayment = async (body) =>
  bmsRequest('POST', '/payments', { body })

const getPaymentModes = async () => ({
  success: true,
  data: [
    { id: 1, name: 'Cash' },
    { id: 2, name: 'Bank Transfer' },
    { id: 3, name: 'Cheque' },
    { id: 4, name: 'UPI' },
    { id: 5, name: 'Credit Card' },
    { id: 6, name: 'Debit Card' },
  ],
})

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  sendInvoice,
  downloadInvoicePdf,
  createPayment,
  getPaymentModes,
}
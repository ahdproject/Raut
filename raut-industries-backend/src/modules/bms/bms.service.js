const axios = require('axios')

const BMS_BASE = (process.env.BMS_API_URL || 'https://app.octabms.com/api').replace(/\/$/, '')

let _token     = null
let _expiresAt = 0

const http = axios.create({
  baseURL: BMS_BASE,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

const parseExpiry = (jwt) => {
  try {
    const p = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString())
    return p.exp ? p.exp * 1000 : Date.now() + 23 * 3_600_000
  } catch { return Date.now() + 23 * 3_600_000 }
}

const getToken = async () => {
  if (_token && Date.now() < _expiresAt - 300_000) return _token
  console.log('🔐 BMS: authenticating…')
  const res  = await http.post('/v1/auth/login', {
    email:    process.env.BMS_EMAIL,
    password: process.env.BMS_PASSWORD,
  })
  _token     = res.data?.data?.access_token
  _expiresAt = parseExpiry(_token)
  console.log('✅ BMS: token acquired, expires', new Date(_expiresAt).toISOString())
  return _token
}

const proxyToBMS = async ({ method, path, params, data }, retry = true) => {
  const token = await getToken()
  try {
    const res = await http.request({
      method,
      url:    `/v1${path}`,
      params,
      data,
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
  } catch (err) {
    if (err.response?.status === 401 && retry) {
      _token = null; _expiresAt = 0
      return proxyToBMS({ method, path, params, data }, false)
    }
    throw err
  }
}

const streamFromBMS = async (path, params, retry = true) => {
  const token = await getToken()
  try {
    const res = await http.get(`/v1${path}`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'stream',
    })
    return {
      stream:      res.data,
      contentType: res.headers['content-type'] || 'application/pdf',
      disposition: res.headers['content-disposition'] || 'inline',
    }
  } catch (err) {
    if (err.response?.status === 401 && retry) {
      _token = null; _expiresAt = 0
      return streamFromBMS(path, params, false)
    }
    throw err
  }
}

module.exports = { proxyToBMS, streamFromBMS }
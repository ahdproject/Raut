const express = require('express')
const cors = require('cors')
const errorHandler = require('./middlewares/error.middleware')

const authRoutes = require('./modules/auth/auth.routes')
const userRoutes = require('./modules/users/users.routes')
const clientRoutes = require('./modules/clients/clients.routes')
const gstSlabRoutes = require('./modules/gst-slabs/gstSlabs.routes')
const productRoutes = require('./modules/products/products.routes')
const chargeTypeRoutes = require('./modules/charge-types/chargeTypes.routes')
const billRoutes = require('./modules/bills/bills.routes')
const employeeRoutes = require('./modules/employees/employees.routes')
const attendanceRoutes = require('./modules/attendance/attendance.routes')
const reportRoutes = require('./modules/reports/reports.routes')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok', project: 'Raut Industries' }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/gst-slabs', gstSlabRoutes)
app.use('/api/products', productRoutes)
app.use('/api/charge-types', chargeTypeRoutes)
app.use('/api/bills', billRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/reports', reportRoutes)

app.use(errorHandler)

module.exports = app
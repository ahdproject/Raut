const express      = require('express')
const router       = express.Router()
const ctrl         = require('./bms.controller')
const authenticate = require('../../middlewares/auth.middleware')

router.use(authenticate)

router.get('/invoices',            ctrl.getInvoices)
router.post('/invoices',           ctrl.createInvoice)
router.get('/invoices/:id',        ctrl.getInvoiceById)
router.post('/invoices/:id/send',  ctrl.sendInvoice)
router.get('/invoices/:id/pdf',    ctrl.downloadInvoicePdf)
router.post('/payments',           ctrl.createPayment)
router.get('/payment-modes',       ctrl.getPaymentModes)

module.exports = router
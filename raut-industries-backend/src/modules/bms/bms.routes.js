const express      = require('express');
const router       = express.Router();
const ctrl         = require('./bms.controller');
const authenticate = require('../../middlewares/auth.middleware');

router.use(authenticate);

// ── Send a Raut bill via BMS email + template ────────────────────────────────
// POST /api/bms/send-bill  { billId, email, send_copy_to, message }
router.post('/send-bill', ctrl.sendBillViaBMS);

// ── Generic proxy for all other BMS routes ───────────────────────────────────
// Maps to: GET/POST /api/bms/invoices, /api/bms/invoices/:id/pdf etc.
router.all('/{*splat}', ctrl.proxy);

module.exports = router;
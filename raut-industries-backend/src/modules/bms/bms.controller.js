const { proxyToBMS, streamFromBMS } = require('./bms.service');
const billsService = require('../bills/bills.service');
const logger = require('../../utils/logger');

// ── Generic proxy ─────────────────────────────────────────────────────────────
const proxy = async (req, res, next) => {
  try {
    // PDF — stream binary directly
    if (req.path.endsWith('/pdf')) {
      const { stream, contentType, disposition } =
        await streamFromBMS(req.path, req.query);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', disposition);
      stream.pipe(res);
      return;
    }

    const hasBody = req.body && Object.keys(req.body).length > 0;
    const result  = await proxyToBMS({
      method: req.method,
      path:   req.path,
      params: req.query,
      data:   hasBody ? req.body : undefined,
    });
    res.status(200).json(result);
  } catch (err) {
    const status  = err.status || err.response?.status  || 500;
    const message = err.response?.data?.message || err.message || 'BMS error';
    
    // Handle 429 with Retry-After header
    if (status === 429) {
      const retryAfter = err.retryAfter || (err.response?.headers?.['retry-after'] || 5);
      res.setHeader('Retry-After', retryAfter);
      logger.warn(`BMS rate limited [429]. Retry after ${retryAfter}s for ${req.method} ${req.path}`);
    } else {
      logger.error(`BMS proxy [${status}] ${req.method} ${req.path}: ${message}`);
    }
    
    res.status(status).json({ success: false, message });
  }
};

// ── Send Raut bill via BMS email (uses BMS template) ─────────────────────────
const sendBillViaBMS = async (req, res) => {
  const { billId, email, send_copy_to, message } = req.body;

  if (!billId)  return res.status(400).json({ success: false, message: 'billId is required' });
  if (!email)   return res.status(400).json({ success: false, message: 'email is required' });

  try {
    // 1. Fetch full Raut bill (with line_items and client)
    const bill = await billsService.getBillById(billId);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    // 2. Create invoice in BMS using Raut bill data
    const createRes = await proxyToBMS({
      method: 'POST',
      path:   '/invoices',
      data: {
        is_client_master_linked:      false,
        is_particulars_master_linked: false,

        // Client info from Raut bill
        client_name:     bill.client_name     || bill.client?.name     || 'Client',
        client_email:    bill.client_email    || bill.client?.email    || email,
        client_phone:    bill.client_phone    || bill.client?.phone    || '',
        billing_address: bill.client_address  || bill.client?.address  || '',
        gstin:           bill.client_gstin    || bill.client?.gstin    || '',
        pan:             bill.client_pan      || bill.client?.pan      || '',
        state:           bill.client_state    || bill.client?.state    || '',

        invoice_date: bill.bill_date,
        due_date:     bill.due_date || (() => {
          const d = new Date(bill.bill_date);
          d.setDate(d.getDate() + 30);
          return d.toISOString().slice(0, 10);
        })(),
        notes:           bill.notes || bill.payment_terms || null,
        discount_amount: 0,

        // Map Raut line items → BMS items
        items: (bill.line_items || []).map(item => ({
          item_name:           item.product_name || item.description,
          description:         item.description  || item.product_name,
          hsn_sac_code:        item.hsn_code     || null,
          uom:                 item.product_unit || item.unit || 'NOS',
          quantity:            item.qty,
          unit_price:          item.rate,
          tax_percentage:
            (parseFloat(item.cgst_rate) || 0) +
            (parseFloat(item.sgst_rate) || 0) +
            (parseFloat(item.igst_rate) || 0),
          discount_percentage: 0,
        })),
      },
    });

    const bmsInvoiceId =
      createRes?.data?.invoice?.invoice_id ||
      createRes?.data?.invoice_id          ||
      createRes?.data?.id;

    if (!bmsInvoiceId) {
      logger.error('BMS invoice created but no ID returned:', createRes);
      return res.status(500).json({
        success: false,
        message: 'BMS invoice created but ID not returned',
      });
    }

    logger.info(`✅ BMS invoice created: ${bmsInvoiceId} for Raut bill #${bill.bill_no}`);

    // 3. Send the BMS invoice via BMS email (uses M&D Reference template)
    const ccList = send_copy_to
      ? send_copy_to.split(',').map(e => e.trim()).filter(Boolean)
      : [];

    await proxyToBMS({
      method: 'POST',
      path:   `/invoices/${bmsInvoiceId}/send`,
      data: {
        email:        email.trim(),
        send_copy_to: ccList,
        message:      message || undefined,
      },
    });

    logger.info(`📧 BMS invoice ${bmsInvoiceId} sent to ${email}`);

    res.status(200).json({
      success: true,
      message: `Bill #${bill.bill_no} sent to ${email} via BMS`,
      data:    { bms_invoice_id: bmsInvoiceId, bill_no: bill.bill_no },
    });

  } catch (err) {
    const status  = err.response?.status  || 500;
    const message = err.response?.data?.message || err.message;
    logger.error('BMS sendBillViaBMS error:', message);
    res.status(status).json({ success: false, message });
  }
};

module.exports = { proxy, sendBillViaBMS };
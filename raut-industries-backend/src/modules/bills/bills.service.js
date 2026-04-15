const pool = require('../../config/db')
const billsRepository = require('./bills.repository')
const productsRepository = require('../products/products.repository')
const clientsRepository = require('../clients/clients.repository')
const chargeTypesRepository = require('../charge-types/chargeTypes.repository')
const usersRepository = require('../users/users.repository')
const {
  calculateLineItem,
  calculateOtherCharge,
  calculateBillTotals,
} = require('./bills.calculator')
const { BILL_MESSAGES, BILL_STATUS } = require('./bills.constants')
const emailService = require('../../utils/emailService')

// ─── Shared: resolve and calculate all inputs ─────────────────

const resolveAndCalculate = async (clientId, lineItemsInput, otherChargesInput = []) => {
  // Fetch and validate client
  const client = await clientsRepository.findById(clientId)
  if (!client || !client.is_active) {
    throw { statusCode: 400, message: BILL_MESSAGES.CLIENT_NOT_FOUND }
  }

  // Validate each other charge has either charge_type_id or custom_name
  for (const charge of otherChargesInput) {
    if (!charge.charge_type_id && !charge.custom_name) {
      throw { statusCode: 400, message: BILL_MESSAGES.EITHER_CHARGE_TYPE_OR_CUSTOM }
    }
    if (charge.charge_type_id) {
      const chargeType = await chargeTypesRepository.findById(charge.charge_type_id)
      if (!chargeType || !chargeType.is_active) {
        throw { statusCode: 400, message: BILL_MESSAGES.CHARGE_TYPE_NOT_FOUND }
      }
    }
  }

  // Resolve each line item — fetch product + gst slab
  const calculatedLineItems = []
  for (const item of lineItemsInput) {
    const product = await productsRepository.findById(item.product_id)
    if (!product || !product.is_active) {
      throw { statusCode: 400, message: BILL_MESSAGES.PRODUCT_NOT_FOUND }
    }

    const gstSlab = {
      cgst_rate: product.cgst_rate,
      sgst_rate: product.sgst_rate,
      igst_rate: product.igst_rate,
    }

    calculatedLineItems.push(
      calculateLineItem({
        product_id: product.id,
        description: item.description || product.name,
        hsn_code: product.hsn_code,
        qty: item.qty,
        rate: item.rate,
        gstSlab,
        clientStateCode: client.state_code,
        sort_order: item.sort_order || 1,
      })
    )
  }

  // Calculate other charges
  const calculatedOtherCharges = otherChargesInput.map((charge) =>
    calculateOtherCharge({
      charge_type_id: charge.charge_type_id || null,
      custom_name: charge.custom_name || null,
      qty: charge.qty,
      rate: charge.rate,
      sort_order: charge.sort_order || 1,
    })
  )

  // Aggregate totals
  const totals = calculateBillTotals(calculatedLineItems, calculatedOtherCharges)

  return { client, calculatedLineItems, calculatedOtherCharges, totals }
}

// ─── Preview (no DB write) ────────────────────────────────────

const previewBill = async ({ client_id, line_items, other_charges = [] }) => {
  const { calculatedLineItems, calculatedOtherCharges, totals } =
    await resolveAndCalculate(client_id, line_items, other_charges)

  return {
    line_items: calculatedLineItems,
    other_charges: calculatedOtherCharges,
    totals,
  }
}

// ─── Get Next Bill Number (read-only, for display only) ───────

const getNextBillNumber = async () => {
  const client = await pool.connect()
  try {
    const result = await client.query(
      `SELECT COALESCE(MAX(bill_no), 0) + 1 AS next_no FROM bills`
    )
    return parseInt(result.rows[0].next_no)
  } finally {
    client.release()
  }
}

// ─── Get All Bills ────────────────────────────────────────────

const getAllBills = async (filters) => {
  return await billsRepository.findAll(filters)
}

// ─── Get Single Bill with children ───────────────────────────

const getBillById = async (id) => {
  const bill = await billsRepository.findById(id)
  if (!bill) {
    throw { statusCode: 404, message: BILL_MESSAGES.NOT_FOUND }
  }

  const lineItems = await billsRepository.findLineItemsByBillId(id)
  const otherCharges = await billsRepository.findOtherChargesByBillId(id)

  return { ...bill, line_items: lineItems, other_charges: otherCharges }
}

// ─── Create Bill ──────────────────────────────────────────────

const createBill = async (data, createdBy) => {
  const {
    bill_date, client_id, transport_mode, vehicle_number,
    place_of_supply, ref_number, payment_terms, notes,
    line_items, other_charges = [],
  } = data

  const { calculatedLineItems, calculatedOtherCharges, totals } =
    await resolveAndCalculate(client_id, line_items, other_charges)

  // Get next bill number inside a transaction (handled in repository)
  const dbClient = await pool.connect()
  let billNo
  try {
    await dbClient.query('BEGIN')
    billNo = await billsRepository.getNextBillNumber(dbClient)
    await dbClient.query('COMMIT')
  } catch (err) {
    await dbClient.query('ROLLBACK')
    throw err
  } finally {
    dbClient.release()
  }

  const billId = await billsRepository.create({
    billNo,
    bill_date,
    client_id,
    transport_mode,
    vehicle_number,
    place_of_supply,
    ref_number,
    payment_terms,
    notes,
    totals,
    calculatedLineItems,
    calculatedOtherCharges,
    created_by: createdBy,
  })

  const bill = await getBillById(billId)

  // Send email notification to admin asynchronously (non-blocking)
  try {
    const createdByUser = await usersRepository.findById(createdBy)
    const client = await clientsRepository.findById(bill.client_id)
    emailService.sendBillCreationNotification({
      ...bill,
      client: client || { name: 'N/A' },
      created_by_name: createdByUser?.name || 'User',
    }).catch((err) => {
      // Log error but don't throw - email is non-critical
      console.error('Error sending bill creation email:', err)
    })
  } catch (err) {
    // Silently fail email sending - it shouldn't block bill creation
    console.error('Error in email notification process:', err)
  }

  return bill
}

// ─── Update Bill (draft only) ─────────────────────────────────

const updateBill = async (id, data) => {
  const existing = await billsRepository.findById(id)
  if (!existing) {
    throw { statusCode: 404, message: BILL_MESSAGES.NOT_FOUND }
  }

  if (existing.status === BILL_STATUS.CONFIRMED) {
    throw { statusCode: 400, message: BILL_MESSAGES.CANNOT_EDIT_CONFIRMED }
  }

  if (existing.status === BILL_STATUS.CANCELLED) {
    throw { statusCode: 400, message: BILL_MESSAGES.CANNOT_EDIT_CANCELLED }
  }

  const clientId = data.client_id || existing.client_id
  const lineItemsInput = data.line_items
  const otherChargesInput = data.other_charges || []

  const { calculatedLineItems, calculatedOtherCharges, totals } =
    await resolveAndCalculate(clientId, lineItemsInput, otherChargesInput)

  await billsRepository.update(id, {
    bill_date: data.bill_date,
    client_id: data.client_id,
    transport_mode: data.transport_mode,
    vehicle_number: data.vehicle_number,
    place_of_supply: data.place_of_supply,
    ref_number: data.ref_number,
    payment_terms: data.payment_terms,
    notes: data.notes,
    totals,
    calculatedLineItems,
    calculatedOtherCharges,
  })

  return await getBillById(id)
}

// ─── Confirm Bill ─────────────────────────────────────────────

const confirmBill = async (id) => {
  const existing = await billsRepository.findById(id)
  if (!existing) {
    throw { statusCode: 404, message: BILL_MESSAGES.NOT_FOUND }
  }

  if (existing.status === BILL_STATUS.CONFIRMED) {
    throw { statusCode: 400, message: BILL_MESSAGES.ALREADY_CONFIRMED }
  }

  if (existing.status === BILL_STATUS.CANCELLED) {
    throw { statusCode: 400, message: BILL_MESSAGES.CANNOT_CONFIRM_CANCELLED }
  }

  return await billsRepository.updateStatus(id, BILL_STATUS.CONFIRMED)
}

// ─── Cancel Bill ──────────────────────────────────────────────

const cancelBill = async (id) => {
  const existing = await billsRepository.findById(id)
  if (!existing) {
    throw { statusCode: 404, message: BILL_MESSAGES.NOT_FOUND }
  }

  if (existing.status === BILL_STATUS.CANCELLED) {
    throw { statusCode: 400, message: BILL_MESSAGES.ALREADY_CANCELLED }
  }

  return await billsRepository.updateStatus(id, BILL_STATUS.CANCELLED)
}

module.exports = {
  previewBill,
  getNextBillNumber,
  getAllBills,
  getBillById,
  createBill,
  updateBill,
  confirmBill,
  cancelBill,
}
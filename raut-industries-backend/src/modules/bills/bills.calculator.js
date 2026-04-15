const env = require('../../config/env')

/**
 * Determines if the transaction is inter-state
 * by comparing client state code to company state code
 */
const isInterState = (clientStateCode) => {
  return String(clientStateCode).trim() !== String(env.companyStateCode).trim()
}

/**
 * Calculates a single line item
 * Returns all computed fields ready for DB insert
 */
const calculateLineItem = ({
  product_id,
  description,
  hsn_code,
  qty,
  rate,
  gstSlab,
  clientStateCode,
  sort_order,
}) => {
  const amount = parseFloat((qty * rate).toFixed(2))
  const interState = isInterState(clientStateCode)

  let cgstRate = 0
  let sgstRate = 0
  let igstRate = 0
  let cgstAmount = 0
  let sgstAmount = 0
  let igstAmount = 0

  if (interState) {
    igstRate = parseFloat(gstSlab.igst_rate)
    igstAmount = parseFloat((amount * igstRate / 100).toFixed(2))
  } else {
    cgstRate = parseFloat(gstSlab.cgst_rate)
    sgstRate = parseFloat(gstSlab.sgst_rate)
    cgstAmount = parseFloat((amount * cgstRate / 100).toFixed(2))
    sgstAmount = parseFloat((amount * sgstRate / 100).toFixed(2))
  }

  const lineTotal = parseFloat(
    (amount + cgstAmount + sgstAmount + igstAmount).toFixed(2)
  )

  return {
    product_id,
    description: description || null,
    hsn_code,
    qty: parseFloat(qty),
    rate: parseFloat(rate),
    amount,
    cgst_rate: cgstRate,
    sgst_rate: sgstRate,
    igst_rate: igstRate,
    cgst_amount: cgstAmount,
    sgst_amount: sgstAmount,
    igst_amount: igstAmount,
    line_total: lineTotal,
    sort_order: sort_order || 1,
  }
}

/**
 * Calculates a single other charge
 * Returns computed fields ready for DB insert
 */
const calculateOtherCharge = ({
  charge_type_id,
  custom_name,
  qty,
  rate,
  sort_order,
}) => {
  const amount = parseFloat((qty * rate).toFixed(2))
  return {
    charge_type_id: charge_type_id || null,
    custom_name: custom_name || null,
    qty: parseFloat(qty),
    rate: parseFloat(rate),
    amount,
    sort_order: sort_order || 1,
  }
}

/**
 * Aggregates all computed line items and other charges
 * into bill-level header totals
 */
const calculateBillTotals = (calculatedLineItems, calculatedOtherCharges) => {
  const subtotal = parseFloat(
    calculatedLineItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2)
  )

  const cgstTotal = parseFloat(
    calculatedLineItems.reduce((sum, item) => sum + item.cgst_amount, 0).toFixed(2)
  )

  const sgstTotal = parseFloat(
    calculatedLineItems.reduce((sum, item) => sum + item.sgst_amount, 0).toFixed(2)
  )

  const igstTotal = parseFloat(
    calculatedLineItems.reduce((sum, item) => sum + item.igst_amount, 0).toFixed(2)
  )

  const gstTotal = parseFloat((cgstTotal + sgstTotal + igstTotal).toFixed(2))

  const totalWithGst = parseFloat((subtotal + gstTotal).toFixed(2))

  const otherChargesTotal = parseFloat(
    calculatedOtherCharges.reduce((sum, c) => sum + c.amount, 0).toFixed(2)
  )

  const totalPieces = parseFloat(
    calculatedLineItems.reduce((sum, item) => sum + item.qty, 0).toFixed(3)
  )

  const differenceAmount = parseFloat((subtotal - otherChargesTotal).toFixed(2))

  const perPieceValue =
    totalPieces > 0
      ? parseFloat((differenceAmount / totalPieces).toFixed(2))
      : 0

  return {
    subtotal,
    cgst_total: cgstTotal,
    sgst_total: sgstTotal,
    igst_total: igstTotal,
    gst_total: gstTotal,
    total_with_gst: totalWithGst,
    other_charges_total: otherChargesTotal,
    total_pieces: totalPieces,
    difference_amount: differenceAmount,
    per_piece_value: perPieceValue,
  }
}

module.exports = {
  isInterState,
  calculateLineItem,
  calculateOtherCharge,
  calculateBillTotals,
}
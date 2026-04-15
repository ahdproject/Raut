const env = require('../config/env')

/**
 * Determines whether to apply CGST+SGST or IGST
 * based on client state code vs company state code
 */
const isInterState = (clientStateCode) => {
  return String(clientStateCode) !== String(env.companyStateCode)
}

/**
 * Calculates a single line item's amounts
 */
const calculateLineItem = (qty, rate, gstSlab, clientStateCode) => {
  const amount = parseFloat((qty * rate).toFixed(2))
  const interState = isInterState(clientStateCode)

  let cgstAmount = 0
  let sgstAmount = 0
  let igstAmount = 0

  if (interState) {
    igstAmount = parseFloat((amount * gstSlab.igst_rate / 100).toFixed(2))
  } else {
    cgstAmount = parseFloat((amount * gstSlab.cgst_rate / 100).toFixed(2))
    sgstAmount = parseFloat((amount * gstSlab.sgst_rate / 100).toFixed(2))
  }

  const lineTotal = parseFloat((amount + cgstAmount + sgstAmount + igstAmount).toFixed(2))

  return {
    amount,
    cgst_rate: interState ? 0 : gstSlab.cgst_rate,
    sgst_rate: interState ? 0 : gstSlab.sgst_rate,
    igst_rate: interState ? gstSlab.igst_rate : 0,
    cgst_amount: cgstAmount,
    sgst_amount: sgstAmount,
    igst_amount: igstAmount,
    line_total: lineTotal,
  }
}

/**
 * Calculates a single other charge amount
 */
const calculateOtherCharge = (qty, rate) => {
  return parseFloat((qty * rate).toFixed(2))
}

/**
 * Aggregates all line items and other charges into bill header totals
 */
const calculateBillTotals = (lineItems, otherCharges) => {
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const cgstTotal = lineItems.reduce((sum, item) => sum + item.cgst_amount, 0)
  const sgstTotal = lineItems.reduce((sum, item) => sum + item.sgst_amount, 0)
  const igstTotal = lineItems.reduce((sum, item) => sum + item.igst_amount, 0)
  const gstTotal = parseFloat((cgstTotal + sgstTotal + igstTotal).toFixed(2))
  const totalWithGst = parseFloat((subtotal + gstTotal).toFixed(2))
  const otherChargesTotal = otherCharges.reduce((sum, c) => sum + c.amount, 0)
  const totalPieces = lineItems.reduce((sum, item) => sum + parseFloat(item.qty), 0)
  const differenceAmount = parseFloat((subtotal - otherChargesTotal).toFixed(2))
  const perPieceValue = totalPieces > 0
    ? parseFloat((differenceAmount / totalPieces).toFixed(2))
    : 0

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    cgst_total: parseFloat(cgstTotal.toFixed(2)),
    sgst_total: parseFloat(sgstTotal.toFixed(2)),
    igst_total: parseFloat(igstTotal.toFixed(2)),
    gst_total: gstTotal,
    total_with_gst: totalWithGst,
    other_charges_total: parseFloat(otherChargesTotal.toFixed(2)),
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
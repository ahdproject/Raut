const pool = require('../../config/db')

// ─── Bill Number ──────────────────────────────────────────────

/**
 * Gets the next bill number inside an existing transaction client
 * Always call this within a BEGIN / COMMIT block
 */
const getNextBillNumber = async (client) => {
  // Lock the bills table explicitly to prevent concurrent inserts from generating the same bill_no
  await client.query(`LOCK TABLE bills IN EXCLUSIVE MODE`)
  
  const result = await client.query(
    `SELECT COALESCE(MAX(bill_no), 0) + 1 AS next_no FROM bills`
  )
  return parseInt(result.rows[0].next_no)
}

// ─── Fetch Helpers ────────────────────────────────────────────

const findAll = async ({ search = '', status = '', month = null, year = null, clientId = '' }) => {
  const result = await pool.query(
    `SELECT
       b.id,
       b.bill_no,
       b.bill_date,
       b.status,
       b.subtotal,
       b.gst_total,
       b.total_with_gst,
       b.other_charges_total,
       b.difference_amount,
       b.per_piece_value,
       b.total_pieces,
       b.created_at,
       c.id   AS client_id,
       c.name AS client_name,
       c.gstin AS client_gstin,
       u.name AS created_by_name
     FROM bills b
     JOIN clients c ON b.client_id = c.id
     JOIN users u   ON b.created_by = u.id
     WHERE
       ($1 = '' OR LOWER(c.name) LIKE LOWER($2))
       AND ($3 = '' OR b.status = $3)
       AND ($4::int IS NULL OR EXTRACT(MONTH FROM b.bill_date) = $4)
       AND ($5::int IS NULL OR EXTRACT(YEAR  FROM b.bill_date) = $5)
       AND ($6 = '' OR b.client_id::text = $6)
     ORDER BY b.bill_no DESC`,
    [search, `%${search}%`, status, month, year, clientId]
  )
  return result.rows
}

const findById = async (id) => {
  const result = await pool.query(
    `SELECT
       b.*,
       c.name       AS client_name,
       c.address    AS client_address,
       c.gstin      AS client_gstin,
       c.state_code AS client_state_code,
       u.name       AS created_by_name
     FROM bills b
     JOIN clients c ON b.client_id = c.id
     JOIN users u   ON b.created_by = u.id
     WHERE b.id = $1`,
    [id]
  )
  return result.rows[0] || null
}

const findLineItemsByBillId = async (billId) => {
  const result = await pool.query(
    `SELECT
       li.*,
       p.name AS product_name,
       p.unit AS product_unit
     FROM bill_line_items li
     JOIN product_masters p ON li.product_id = p.id
     WHERE li.bill_id = $1
     ORDER BY li.sort_order ASC`,
    [billId]
  )
  return result.rows
}

const findOtherChargesByBillId = async (billId) => {
  const result = await pool.query(
    `SELECT
       oc.*,
       ct.name AS charge_type_name
     FROM bill_other_charges oc
     LEFT JOIN other_charge_types ct ON oc.charge_type_id = ct.id
     WHERE oc.bill_id = $1
     ORDER BY oc.sort_order ASC`,
    [billId]
  )
  return result.rows
}

// ─── Create (full transaction) ────────────────────────────────

const create = async ({
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
  created_by,
}) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Insert bill header
    const billResult = await client.query(
      `INSERT INTO bills (
         bill_no, bill_date, client_id,
         transport_mode, vehicle_number, place_of_supply,
         ref_number, payment_terms, notes,
         subtotal, cgst_total, sgst_total, igst_total,
         gst_total, other_charges_total, total_with_gst,
         difference_amount, per_piece_value, total_pieces,
         status, created_by
       ) VALUES (
         $1,  $2,  $3,
         $4,  $5,  $6,
         $7,  $8,  $9,
         $10, $11, $12, $13,
         $14, $15, $16,
         $17, $18, $19,
         'draft', $20
       )
       RETURNING id`,
      [
        billNo, bill_date, client_id,
        transport_mode || null, vehicle_number || null, place_of_supply || null,
        ref_number || null, payment_terms || null, notes || null,
        totals.subtotal, totals.cgst_total, totals.sgst_total, totals.igst_total,
        totals.gst_total, totals.other_charges_total, totals.total_with_gst,
        totals.difference_amount, totals.per_piece_value, totals.total_pieces,
        created_by,
      ]
    )

    const billId = billResult.rows[0].id

    // Insert line items
    for (const item of calculatedLineItems) {
      await client.query(
        `INSERT INTO bill_line_items (
           bill_id, product_id, description, hsn_code,
           qty, rate, amount,
           cgst_rate, sgst_rate, igst_rate,
           cgst_amount, sgst_amount, igst_amount,
           line_total, sort_order
         ) VALUES (
           $1,  $2,  $3,  $4,
           $5,  $6,  $7,
           $8,  $9,  $10,
           $11, $12, $13,
           $14, $15
         )`,
        [
          billId, item.product_id, item.description, item.hsn_code,
          item.qty, item.rate, item.amount,
          item.cgst_rate, item.sgst_rate, item.igst_rate,
          item.cgst_amount, item.sgst_amount, item.igst_amount,
          item.line_total, item.sort_order,
        ]
      )
    }

    // Insert other charges
    for (const charge of calculatedOtherCharges) {
      await client.query(
        `INSERT INTO bill_other_charges (
           bill_id, charge_type_id, custom_name,
           qty, rate, amount, sort_order
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          billId, charge.charge_type_id, charge.custom_name,
          charge.qty, charge.rate, charge.amount, charge.sort_order,
        ]
      )
    }

    await client.query('COMMIT')
    return billId
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// ─── Update (full transaction — replace children) ─────────────

const update = async (id, {
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
}) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Update bill header
    await client.query(
      `UPDATE bills SET
         bill_date           = COALESCE($1,  bill_date),
         client_id           = COALESCE($2,  client_id),
         transport_mode      = COALESCE($3,  transport_mode),
         vehicle_number      = COALESCE($4,  vehicle_number),
         place_of_supply     = COALESCE($5,  place_of_supply),
         ref_number          = COALESCE($6,  ref_number),
         payment_terms       = COALESCE($7,  payment_terms),
         notes               = COALESCE($8,  notes),
         subtotal            = $9,
         cgst_total          = $10,
         sgst_total          = $11,
         igst_total          = $12,
         gst_total           = $13,
         other_charges_total = $14,
         total_with_gst      = $15,
         difference_amount   = $16,
         per_piece_value     = $17,
         total_pieces        = $18,
         updated_at          = NOW()
       WHERE id = $19`,
      [
        bill_date, client_id,
        transport_mode, vehicle_number, place_of_supply,
        ref_number, payment_terms, notes,
        totals.subtotal, totals.cgst_total, totals.sgst_total,
        totals.igst_total, totals.gst_total, totals.other_charges_total,
        totals.total_with_gst, totals.difference_amount,
        totals.per_piece_value, totals.total_pieces,
        id,
      ]
    )

    // Delete old children — ON DELETE CASCADE handles this
    // but doing explicit delete for clarity
    await client.query(`DELETE FROM bill_line_items    WHERE bill_id = $1`, [id])
    await client.query(`DELETE FROM bill_other_charges WHERE bill_id = $1`, [id])

    // Re-insert line items
    for (const item of calculatedLineItems) {
      await client.query(
        `INSERT INTO bill_line_items (
           bill_id, product_id, description, hsn_code,
           qty, rate, amount,
           cgst_rate, sgst_rate, igst_rate,
           cgst_amount, sgst_amount, igst_amount,
           line_total, sort_order
         ) VALUES (
           $1,  $2,  $3,  $4,
           $5,  $6,  $7,
           $8,  $9,  $10,
           $11, $12, $13,
           $14, $15
         )`,
        [
          id, item.product_id, item.description, item.hsn_code,
          item.qty, item.rate, item.amount,
          item.cgst_rate, item.sgst_rate, item.igst_rate,
          item.cgst_amount, item.sgst_amount, item.igst_amount,
          item.line_total, item.sort_order,
        ]
      )
    }

    // Re-insert other charges
    for (const charge of calculatedOtherCharges) {
      await client.query(
        `INSERT INTO bill_other_charges (
           bill_id, charge_type_id, custom_name,
           qty, rate, amount, sort_order
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          id, charge.charge_type_id, charge.custom_name,
          charge.qty, charge.rate, charge.amount, charge.sort_order,
        ]
      )
    }

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// ─── Status Updates ───────────────────────────────────────────

const updateStatus = async (id, status) => {
  const result = await pool.query(
    `UPDATE bills
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, bill_no, status`,
    [status, id]
  )
  return result.rows[0] || null
}

module.exports = {
  getNextBillNumber,
  findAll,
  findById,
  findLineItemsByBillId,
  findOtherChargesByBillId,
  create,
  update,
  updateStatus,
}
const pool = require('../../config/db')

const findAll = async (activeOnly = false) => {
  const query = activeOnly
    ? `SELECT * FROM gst_slabs WHERE is_active = true ORDER BY cgst_rate ASC`
    : `SELECT * FROM gst_slabs ORDER BY cgst_rate ASC`
  const result = await pool.query(query)
  return result.rows
}

const findById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM gst_slabs WHERE id = $1`,
    [id]
  )
  return result.rows[0] || null
}

const findByLabel = async (label) => {
  const result = await pool.query(
    `SELECT * FROM gst_slabs WHERE LOWER(label) = LOWER($1)`,
    [label]
  )
  return result.rows[0] || null
}

const create = async ({ label, cgst_rate, sgst_rate, igst_rate }) => {
  const result = await pool.query(
    `INSERT INTO gst_slabs (label, cgst_rate, sgst_rate, igst_rate)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [label, cgst_rate, sgst_rate, igst_rate]
  )
  return result.rows[0]
}

const update = async (id, fields) => {
  const { label, cgst_rate, sgst_rate, igst_rate, is_active } = fields
  const result = await pool.query(
    `UPDATE gst_slabs
     SET
       label       = COALESCE($1, label),
       cgst_rate   = COALESCE($2, cgst_rate),
       sgst_rate   = COALESCE($3, sgst_rate),
       igst_rate   = COALESCE($4, igst_rate),
       is_active   = COALESCE($5, is_active),
       updated_at  = NOW()
     WHERE id = $6
     RETURNING *`,
    [label, cgst_rate, sgst_rate, igst_rate, is_active, id]
  )
  return result.rows[0] || null
}

const isLinkedToProducts = async (id) => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM product_masters
     WHERE gst_slab_id = $1 AND is_active = true`,
    [id]
  )
  return parseInt(result.rows[0].count) > 0
}

module.exports = {
  findAll,
  findById,
  findByLabel,
  create,
  update,
  isLinkedToProducts,
}
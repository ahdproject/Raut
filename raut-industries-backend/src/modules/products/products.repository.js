const pool = require('../../config/db')

const findAll = async ({ search = '', activeOnly = false }) => {
  const result = await pool.query(
    `SELECT
       p.id,
       p.name,
       p.description,
       p.hsn_code,
       p.unit,
       p.default_rate,
       p.is_active,
       p.created_at,
       p.updated_at,
       g.id           AS gst_slab_id,
       g.label        AS gst_slab_label,
       g.cgst_rate,
       g.sgst_rate,
       g.igst_rate
     FROM product_masters p
     JOIN gst_slabs g ON p.gst_slab_id = g.id
     WHERE
       ($1 = false OR p.is_active = true)
       AND ($2 = '' OR LOWER(p.name) LIKE LOWER($3))
     ORDER BY p.name ASC`,
    [activeOnly, search, `%${search}%`]
  )
  return result.rows
}

const findById = async (id) => {
  const result = await pool.query(
    `SELECT
       p.id,
       p.name,
       p.description,
       p.hsn_code,
       p.unit,
       p.default_rate,
       p.is_active,
       p.created_at,
       p.updated_at,
       g.id           AS gst_slab_id,
       g.label        AS gst_slab_label,
       g.cgst_rate,
       g.sgst_rate,
       g.igst_rate
     FROM product_masters p
     JOIN gst_slabs g ON p.gst_slab_id = g.id
     WHERE p.id = $1`,
    [id]
  )
  return result.rows[0] || null
}

const findByName = async (name) => {
  const result = await pool.query(
    `SELECT id FROM product_masters
     WHERE LOWER(name) = LOWER($1)`,
    [name]
  )
  return result.rows[0] || null
}

const create = async ({
  name,
  description,
  hsn_code,
  unit,
  default_rate,
  gst_slab_id,
}) => {
  const result = await pool.query(
    `INSERT INTO product_masters
       (name, description, hsn_code, unit, default_rate, gst_slab_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      name,
      description || null,
      hsn_code,
      unit,
      default_rate,
      gst_slab_id,
    ]
  )
  return await findById(result.rows[0].id)
}

const update = async (id, fields) => {
  const {
    name,
    description,
    hsn_code,
    unit,
    default_rate,
    gst_slab_id,
    is_active,
  } = fields

  await pool.query(
    `UPDATE product_masters
     SET
       name          = COALESCE($1, name),
       description   = COALESCE($2, description),
       hsn_code      = COALESCE($3, hsn_code),
       unit          = COALESCE($4, unit),
       default_rate  = COALESCE($5, default_rate),
       gst_slab_id   = COALESCE($6, gst_slab_id),
       is_active     = COALESCE($7, is_active),
       updated_at    = NOW()
     WHERE id = $8`,
    [
      name,
      description,
      hsn_code,
      unit,
      default_rate,
      gst_slab_id,
      is_active,
      id,
    ]
  )
  return await findById(id)
}

const isLinkedToBills = async (id) => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM bill_line_items
     WHERE product_id = $1`,
    [id]
  )
  return parseInt(result.rows[0].count) > 0
}

module.exports = {
  findAll,
  findById,
  findByName,
  create,
  update,
  isLinkedToBills,
}
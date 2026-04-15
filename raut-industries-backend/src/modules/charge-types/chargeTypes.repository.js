const pool = require('../../config/db')

const findAll = async (activeOnly = false) => {
  const query = activeOnly
    ? `SELECT * FROM other_charge_types WHERE is_active = true ORDER BY name ASC`
    : `SELECT * FROM other_charge_types ORDER BY name ASC`
  const result = await pool.query(query)
  return result.rows
}

const findById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM other_charge_types WHERE id = $1`,
    [id]
  )
  return result.rows[0] || null
}

const findByName = async (name) => {
  const result = await pool.query(
    `SELECT * FROM other_charge_types WHERE LOWER(name) = LOWER($1)`,
    [name]
  )
  return result.rows[0] || null
}

const create = async (name) => {
  const result = await pool.query(
    `INSERT INTO other_charge_types (name)
     VALUES ($1)
     RETURNING *`,
    [name]
  )
  return result.rows[0]
}

const update = async (id, fields) => {
  const { name, is_active } = fields
  const result = await pool.query(
    `UPDATE other_charge_types
     SET
       name       = COALESCE($1, name),
       is_active  = COALESCE($2, is_active),
       updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [name, is_active, id]
  )
  return result.rows[0] || null
}

const isLinkedToBills = async (id) => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM bill_other_charges
     WHERE charge_type_id = $1`,
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
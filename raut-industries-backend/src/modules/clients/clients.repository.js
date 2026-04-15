const pool = require('../../config/db')

const findAll = async (search = '') => {
  const result = await pool.query(
    `SELECT id, name, address, gstin, state_code, phone, is_active, created_at
     FROM clients
     WHERE
       is_active = true AND
       ($1 = '' OR LOWER(name) LIKE LOWER($2))
     ORDER BY name ASC`,
    [search, `%${search}%`]
  )
  return result.rows
}

const findById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM clients WHERE id = $1`,
    [id]
  )
  return result.rows[0] || null
}

const findByGstin = async (gstin) => {
  const result = await pool.query(
    `SELECT * FROM clients WHERE gstin = $1`,
    [gstin]
  )
  return result.rows[0] || null
}

const create = async ({ name, address, gstin, state_code, phone }) => {
  const result = await pool.query(
    `INSERT INTO clients (name, address, gstin, state_code, phone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, address || null, gstin || null, state_code, phone || null]
  )
  return result.rows[0]
}

const update = async (id, fields) => {
  const { name, address, gstin, state_code, phone, is_active } = fields
  const result = await pool.query(
    `UPDATE clients
     SET
       name        = COALESCE($1, name),
       address     = COALESCE($2, address),
       gstin       = COALESCE($3, gstin),
       state_code  = COALESCE($4, state_code),
       phone       = COALESCE($5, phone),
       is_active   = COALESCE($6, is_active),
       updated_at  = NOW()
     WHERE id = $7
     RETURNING *`,
    [name, address, gstin, state_code, phone, is_active, id]
  )
  return result.rows[0] || null
}

module.exports = {
  findAll,
  findById,
  findByGstin,
  create,
  update,
}
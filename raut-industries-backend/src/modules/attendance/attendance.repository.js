const pool = require('../../config/db')

// ─── Single record ops ────────────────────────────────────────

const findByEmployeeAndDate = async (employeeId, date) => {
  const result = await pool.query(
    `SELECT
       a.id, a.employee_id, a.date, a.status, a.notes,
       a.created_at, a.updated_at,
       u.name AS marked_by_name
     FROM attendance a
     JOIN users u ON a.marked_by = u.id
     WHERE a.employee_id = $1 AND a.date = $2`,
    [employeeId, date]
  )
  return result.rows[0] || null
}

const findById = async (id) => {
  const result = await pool.query(
    `SELECT
       a.id, a.employee_id, a.date, a.status, a.notes,
       a.created_at, a.updated_at,
       e.name AS employee_name,
       e.emp_code,
       u.name AS marked_by_name
     FROM attendance a
     JOIN employees e ON a.employee_id = e.id
     JOIN users u     ON a.marked_by   = u.id
     WHERE a.id = $1`,
    [id]
  )
  return result.rows[0] || null
}

const upsert = async ({ employee_id, date, status, notes, marked_by }) => {
  const result = await pool.query(
    `INSERT INTO attendance (employee_id, date, status, notes, marked_by)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (employee_id, date)
     DO UPDATE SET
       status     = EXCLUDED.status,
       notes      = EXCLUDED.notes,
       marked_by  = EXCLUDED.marked_by,
       updated_at = NOW()
     RETURNING id`,
    [employee_id, date, status, notes || null, marked_by]
  )
  return result.rows[0].id
}

const update = async (id, { status, notes, marked_by }) => {
  const result = await pool.query(
    `UPDATE attendance
     SET
       status     = $1,
       notes      = COALESCE($2, notes),
       marked_by  = $3,
       updated_at = NOW()
     WHERE id = $4
     RETURNING id`,
    [status, notes || null, marked_by, id]
  )
  return result.rows[0] || null
}

// ─── Bulk insert (uses upsert for each record in a transaction) ───

const bulkUpsert = async (date, records, markedBy) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    for (const record of records) {
      await client.query(
        `INSERT INTO attendance (employee_id, date, status, notes, marked_by)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (employee_id, date)
         DO UPDATE SET
           status     = EXCLUDED.status,
           notes      = EXCLUDED.notes,
           marked_by  = EXCLUDED.marked_by,
           updated_at = NOW()`,
        [
          record.employee_id,
          date,
          record.status,
          record.notes || null,
          markedBy,
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

// ─── Monthly fetch (for grid view) ───────────────────────────

const findByMonth = async ({ month, year, employeeId = null, department = null }) => {
  const result = await pool.query(
    `SELECT
       a.id,
       a.employee_id,
       a.date,
       a.status,
       a.notes,
       e.name       AS employee_name,
       e.emp_code,
       e.department,
       e.role
     FROM attendance a
     JOIN employees e ON a.employee_id = e.id
     WHERE
       EXTRACT(MONTH FROM a.date) = $1
       AND EXTRACT(YEAR  FROM a.date) = $2
       AND e.is_active = true
       AND ($3::uuid IS NULL OR a.employee_id = $3)
       AND ($4::text IS NULL OR e.department = $4::text)
     ORDER BY e.emp_code ASC, a.date ASC`,
    [month, year, employeeId || null, department || null]
  )
  return result.rows
}

// ─── Monthly summary per employee ────────────────────────────

const getMonthlySummary = async ({ month, year, department = null }) => {
  const result = await pool.query(
    `SELECT
       e.id            AS employee_id,
       e.emp_code,
       e.name          AS employee_name,
       e.role,
       e.department,
       e.salary,
       COUNT(*) FILTER (WHERE a.status = 'present')  AS present_count,
       COUNT(*) FILTER (WHERE a.status = 'absent')   AS absent_count,
       COUNT(*) FILTER (WHERE a.status = 'half_day') AS half_day_count,
       COUNT(*) FILTER (WHERE a.status = 'leave')    AS leave_count,
       COUNT(a.id)                                    AS total_marked_days
     FROM employees e
     LEFT JOIN attendance a
       ON a.employee_id = e.id
       AND EXTRACT(MONTH FROM a.date) = $1
       AND EXTRACT(YEAR  FROM a.date) = $2
     WHERE
       e.is_active = true
       AND ($3::text IS NULL OR e.department = $3::text)
     GROUP BY
       e.id, e.emp_code, e.name, e.role, e.department, e.salary
     ORDER BY e.emp_code ASC`,
    [month, year, department]
  )
  return result.rows
}

// ─── Daily attendance for a given date ───────────────────────

const findByDate = async (date) => {
  const result = await pool.query(
    `SELECT
       e.id         AS employee_id,
       e.emp_code,
       e.name       AS employee_name,
       e.department,
       a.id         AS attendance_id,
       a.status,
       a.notes
     FROM employees e
     LEFT JOIN attendance a
       ON a.employee_id = e.id AND a.date = $1
     WHERE e.is_active = true
     ORDER BY e.emp_code ASC`,
    [date]
  )
  return result.rows
}

module.exports = {
  findByEmployeeAndDate,
  findById,
  upsert,
  update,
  bulkUpsert,
  findByMonth,
  getMonthlySummary,
  findByDate,
}
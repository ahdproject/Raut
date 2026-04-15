const pool = require('../../config/db')

// ─── Sales Summary ────────────────────────────────────────────

const getSalesSummary = async (month, year) => {
  const result = await pool.query(
    `SELECT
       COUNT(b.id)                                         AS total_bills,
       COUNT(b.id) FILTER (WHERE b.status = 'confirmed')  AS confirmed_bills,
       COUNT(b.id) FILTER (WHERE b.status = 'draft')      AS draft_bills,
       COUNT(b.id) FILTER (WHERE b.status = 'cancelled')  AS cancelled_bills,
       COALESCE(SUM(b.subtotal)
         FILTER (WHERE b.status = 'confirmed'), 0)        AS total_subtotal,
       COALESCE(SUM(b.cgst_total)
         FILTER (WHERE b.status = 'confirmed'), 0)        AS total_cgst,
       COALESCE(SUM(b.sgst_total)
         FILTER (WHERE b.status = 'confirmed'), 0)        AS total_sgst,
       COALESCE(SUM(b.igst_total)
         FILTER (WHERE b.status = 'confirmed'), 0)        AS total_igst,
       COALESCE(SUM(b.gst_total)
         FILTER (WHERE b.status = 'confirmed'), 0)        AS total_gst,
       COALESCE(SUM(b.total_with_gst)
         FILTER (WHERE b.status = 'confirmed'), 0)        AS total_with_gst,
       COALESCE(SUM(b.other_charges_total)
         FILTER (WHERE b.status = 'confirmed'), 0)        AS total_other_charges,
       COALESCE(SUM(b.total_pieces)
         FILTER (WHERE b.status = 'confirmed'), 0)        AS total_pieces
     FROM bills b
     WHERE
       EXTRACT(MONTH FROM b.bill_date) = $1
       AND EXTRACT(YEAR  FROM b.bill_date) = $2`,
    [month, year]
  )
  return result.rows[0]
}

// ─── Sales by Product ─────────────────────────────────────────

const getSalesByProduct = async (month, year) => {
  const result = await pool.query(
    `SELECT
       p.id                          AS product_id,
       p.name                        AS product_name,
       p.hsn_code,
       p.unit,
       COUNT(DISTINCT b.id)          AS bill_count,
       SUM(li.qty)                   AS total_qty,
       SUM(li.amount)                AS total_amount,
       SUM(li.cgst_amount)           AS total_cgst,
       SUM(li.sgst_amount)           AS total_sgst,
       SUM(li.igst_amount)           AS total_igst,
       SUM(li.line_total)            AS total_line_total,
       AVG(li.rate)                  AS avg_rate
     FROM bill_line_items li
     JOIN bills          b  ON li.bill_id    = b.id
     JOIN product_masters p ON li.product_id = p.id
     WHERE
       b.status = 'confirmed'
       AND EXTRACT(MONTH FROM b.bill_date) = $1
       AND EXTRACT(YEAR  FROM b.bill_date) = $2
     GROUP BY p.id, p.name, p.hsn_code, p.unit
     ORDER BY total_amount DESC`,
    [month, year]
  )
  return result.rows
}

// ─── Sales by Client ──────────────────────────────────────────

const getSalesByClient = async (month, year) => {
  const result = await pool.query(
    `SELECT
       c.id                 AS client_id,
       c.name               AS client_name,
       c.gstin,
       c.state_code,
       COUNT(b.id)          AS bill_count,
       SUM(b.subtotal)      AS total_subtotal,
       SUM(b.gst_total)     AS total_gst,
       SUM(b.total_with_gst)AS total_with_gst,
       SUM(b.total_pieces)  AS total_pieces
     FROM bills b
     JOIN clients c ON b.client_id = c.id
     WHERE
       b.status = 'confirmed'
       AND EXTRACT(MONTH FROM b.bill_date) = $1
       AND EXTRACT(YEAR  FROM b.bill_date) = $2
     GROUP BY c.id, c.name, c.gstin, c.state_code
     ORDER BY total_with_gst DESC`,
    [month, year]
  )
  return result.rows
}

// ─── Bill List for Month ──────────────────────────────────────

const getBillListForMonth = async (month, year) => {
  const result = await pool.query(
    `SELECT
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
       c.name  AS client_name,
       c.gstin AS client_gstin
     FROM bills b
     JOIN clients c ON b.client_id = c.id
     WHERE
       EXTRACT(MONTH FROM b.bill_date) = $1
       AND EXTRACT(YEAR  FROM b.bill_date) = $2
     ORDER BY b.bill_no ASC`,
    [month, year]
  )
  return result.rows
}

// ─── GST Reconciliation ───────────────────────────────────────

const getGstBreakdown = async (month, year) => {
  const result = await pool.query(
    `SELECT
       li.hsn_code,
       li.cgst_rate,
       li.sgst_rate,
       li.igst_rate,
       SUM(li.amount)       AS taxable_value,
       SUM(li.cgst_amount)  AS cgst_amount,
       SUM(li.sgst_amount)  AS sgst_amount,
       SUM(li.igst_amount)  AS igst_amount,
       SUM(li.cgst_amount + li.sgst_amount + li.igst_amount) AS total_tax
     FROM bill_line_items li
     JOIN bills b ON li.bill_id = b.id
     WHERE
       b.status = 'confirmed'
       AND EXTRACT(MONTH FROM b.bill_date) = $1
       AND EXTRACT(YEAR  FROM b.bill_date) = $2
     GROUP BY li.hsn_code, li.cgst_rate, li.sgst_rate, li.igst_rate
     ORDER BY li.hsn_code ASC`,
    [month, year]
  )
  return result.rows
}

// ─── Attendance Summary for Report ───────────────────────────

const getAttendanceSummaryForReport = async (month, year) => {
  const result = await pool.query(
    `SELECT
       e.emp_code,
       e.name          AS employee_name,
       e.role,
       e.department,
       e.salary        AS monthly_salary,
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
     WHERE e.is_active = true
     GROUP BY
       e.id, e.emp_code, e.name,
       e.role, e.department, e.salary
     ORDER BY e.emp_code ASC`,
    [month, year]
  )
  return result.rows
}

// ─── Total Labour Cost for P&L ────────────────────────────────

const getTotalLabourCost = async (month, year) => {
  const result = await pool.query(
    `SELECT
       COALESCE(SUM(
         CASE
           WHEN total_days > 0 THEN
             (e.salary / total_days) *
             (present_days + (half_day_days * 0.5))
           ELSE 0
         END
       ), 0) AS total_payable_salary
     FROM (
       SELECT
         e.id,
         e.salary,
         COUNT(a.id) AS total_days,
         COUNT(*) FILTER (WHERE a.status = 'present')  AS present_days,
         COUNT(*) FILTER (WHERE a.status = 'half_day') AS half_day_days
       FROM employees e
       LEFT JOIN attendance a
         ON a.employee_id = e.id
         AND EXTRACT(MONTH FROM a.date) = $1
         AND EXTRACT(YEAR  FROM a.date) = $2
       WHERE e.is_active = true
       GROUP BY e.id, e.salary
     ) AS subquery
     JOIN employees e ON e.id = subquery.id`,
    [month, year]
  )
  return parseFloat(result.rows[0]?.total_payable_salary || 0)
}

// ─── Top 10 Bills by Value ────────────────────────────────────

const getTopBills = async (month, year, limit = 10) => {
  const result = await pool.query(
    `SELECT
       b.bill_no,
       b.bill_date,
       b.total_with_gst,
       b.subtotal,
       b.total_pieces,
       c.name AS client_name
     FROM bills b
     JOIN clients c ON b.client_id = c.id
     WHERE
       b.status = 'confirmed'
       AND EXTRACT(MONTH FROM b.bill_date) = $1
       AND EXTRACT(YEAR  FROM b.bill_date) = $2
     ORDER BY b.total_with_gst DESC
     LIMIT $3`,
    [month, year, limit]
  )
  return result.rows
}

module.exports = {
  getSalesSummary,
  getSalesByProduct,
  getSalesByClient,
  getBillListForMonth,
  getGstBreakdown,
  getAttendanceSummaryForReport,
  getTotalLabourCost,
  getTopBills,
}
const reportsRepository = require('./reports.repository')

// ─── Shared Validation Helper ─────────────────────────────────

const validateMonthYear = (month, year) => {
  const m = parseInt(month)
  const y = parseInt(year)
  if (isNaN(m) || m < 1 || m > 12) {
    throw { statusCode: 400, message: 'Month must be between 1 and 12' }
  }
  if (isNaN(y) || y < 2020) {
    throw { statusCode: 400, message: 'Year must be 2020 or later' }
  }
  return { m, y }
}

// ─── Payroll Calculation Helper ───────────────────────────────

const computePayroll = (row) => {
  const presentCount  = parseInt(row.present_count)  || 0
  const absentCount   = parseInt(row.absent_count)   || 0
  const halfDayCount  = parseInt(row.half_day_count) || 0
  const leaveCount    = parseInt(row.leave_count)    || 0
  const totalMarked   = parseInt(row.total_marked_days) || 0
  const monthlySalary = parseFloat(row.monthly_salary) || 0

  const effectiveDays = presentCount + halfDayCount * 0.5
  const perDaySalary  = totalMarked > 0
    ? parseFloat((monthlySalary / totalMarked).toFixed(2))
    : 0
  const payableSalary = parseFloat((effectiveDays * perDaySalary).toFixed(2))

  return {
    present_count:    presentCount,
    absent_count:     absentCount,
    half_day_count:   halfDayCount,
    leave_count:      leaveCount,
    total_marked_days: totalMarked,
    effective_days:   parseFloat(effectiveDays.toFixed(1)),
    monthly_salary:   monthlySalary,
    per_day_salary:   perDaySalary,
    payable_salary:   payableSalary,
  }
}

// ─── 1. Monthly P&L Report ────────────────────────────────────

const getProfitAndLoss = async (month, year) => {
  const { m, y } = validateMonthYear(month, year)

  const salesSummary   = await reportsRepository.getSalesSummary(m, y)
  const labourCost     = await reportsRepository.getTotalLabourCost(m, y)

  const totalSales     = parseFloat(salesSummary.total_subtotal) || 0
  const totalGstSales  = parseFloat(salesSummary.total_gst)      || 0
  const totalWithGst   = parseFloat(salesSummary.total_with_gst) || 0
  const totalPieces    = parseFloat(salesSummary.total_pieces)   || 0
  const confirmedBills = parseInt(salesSummary.confirmed_bills)  || 0

  // Gross profit = Sales (excl GST)
  // Net profit = Gross profit - Labour cost
  // Note: Other expenses (light, water, cash etc.) are manually entered
  // in the monthly report section — tracked outside this module
  const grossProfit = parseFloat(totalSales.toFixed(2))
  const netProfit   = parseFloat((grossProfit - labourCost).toFixed(2))

  return {
    period: { month: m, year: y },
    sales: {
      total_subtotal:    parseFloat(totalSales.toFixed(2)),
      total_gst:         parseFloat(totalGstSales.toFixed(2)),
      total_with_gst:    parseFloat(totalWithGst.toFixed(2)),
      total_pieces:      parseFloat(totalPieces.toFixed(3)),
      confirmed_bills:   confirmedBills,
      draft_bills:       parseInt(salesSummary.draft_bills)     || 0,
      cancelled_bills:   parseInt(salesSummary.cancelled_bills) || 0,
    },
    gst: {
      total_cgst:  parseFloat(salesSummary.total_cgst || 0),
      total_sgst:  parseFloat(salesSummary.total_sgst || 0),
      total_igst:  parseFloat(salesSummary.total_igst || 0),
      total_gst:   parseFloat(totalGstSales.toFixed(2)),
    },
    expenses: {
      labour_cost:   parseFloat(labourCost.toFixed(2)),
      // Placeholders for manually entered expenses
      // These will be added from cash expense module in future
      other_expenses: 0,
      total_expenses: parseFloat(labourCost.toFixed(2)),
    },
    profit: {
      gross_profit: grossProfit,
      net_profit:   netProfit,
    },
  }
}

// ─── 2. GST Reconciliation Report ────────────────────────────

const getGstReconciliation = async (month, year) => {
  const { m, y } = validateMonthYear(month, year)

  const breakdown      = await reportsRepository.getGstBreakdown(m, y)
  const salesSummary   = await reportsRepository.getSalesSummary(m, y)

  const totalTaxableValue = breakdown.reduce(
    (sum, row) => sum + parseFloat(row.taxable_value || 0), 0
  )
  const totalCgst = breakdown.reduce(
    (sum, row) => sum + parseFloat(row.cgst_amount || 0), 0
  )
  const totalSgst = breakdown.reduce(
    (sum, row) => sum + parseFloat(row.sgst_amount || 0), 0
  )
  const totalIgst = breakdown.reduce(
    (sum, row) => sum + parseFloat(row.igst_amount || 0), 0
  )
  const totalTax = parseFloat((totalCgst + totalSgst + totalIgst).toFixed(2))

  return {
    period: { month: m, year: y },
    breakdown: breakdown.map((row) => ({
      hsn_code:       row.hsn_code,
      cgst_rate:      parseFloat(row.cgst_rate),
      sgst_rate:      parseFloat(row.sgst_rate),
      igst_rate:      parseFloat(row.igst_rate),
      taxable_value:  parseFloat(parseFloat(row.taxable_value).toFixed(2)),
      cgst_amount:    parseFloat(parseFloat(row.cgst_amount).toFixed(2)),
      sgst_amount:    parseFloat(parseFloat(row.sgst_amount).toFixed(2)),
      igst_amount:    parseFloat(parseFloat(row.igst_amount).toFixed(2)),
      total_tax:      parseFloat(parseFloat(row.total_tax).toFixed(2)),
    })),
    totals: {
      taxable_value:  parseFloat(totalTaxableValue.toFixed(2)),
      total_cgst:     parseFloat(totalCgst.toFixed(2)),
      total_sgst:     parseFloat(totalSgst.toFixed(2)),
      total_igst:     parseFloat(totalIgst.toFixed(2)),
      total_tax:      totalTax,
      total_with_gst: parseFloat(
        (totalTaxableValue + totalTax).toFixed(2)
      ),
    },
    confirmed_bills: parseInt(salesSummary.confirmed_bills) || 0,
  }
}

// ─── 3. Sales Summary Report ──────────────────────────────────

const getSalesSummaryReport = async (month, year) => {
  const { m, y } = validateMonthYear(month, year)

  const [summary, byProduct, byClient, topBills, billList] =
    await Promise.all([
      reportsRepository.getSalesSummary(m, y),
      reportsRepository.getSalesByProduct(m, y),
      reportsRepository.getSalesByClient(m, y),
      reportsRepository.getTopBills(m, y, 10),
      reportsRepository.getBillListForMonth(m, y),
    ])

  return {
    period: { month: m, year: y },
    overview: {
      total_bills:       parseInt(summary.total_bills)      || 0,
      confirmed_bills:   parseInt(summary.confirmed_bills)  || 0,
      draft_bills:       parseInt(summary.draft_bills)      || 0,
      cancelled_bills:   parseInt(summary.cancelled_bills)  || 0,
      total_subtotal:    parseFloat(parseFloat(summary.total_subtotal  || 0).toFixed(2)),
      total_gst:         parseFloat(parseFloat(summary.total_gst       || 0).toFixed(2)),
      total_with_gst:    parseFloat(parseFloat(summary.total_with_gst  || 0).toFixed(2)),
      total_pieces:      parseFloat(parseFloat(summary.total_pieces    || 0).toFixed(3)),
      other_charges:     parseFloat(parseFloat(summary.total_other_charges || 0).toFixed(2)),
    },
    by_product: byProduct.map((row) => ({
      product_id:       row.product_id,
      product_name:     row.product_name,
      hsn_code:         row.hsn_code,
      unit:             row.unit,
      bill_count:       parseInt(row.bill_count),
      total_qty:        parseFloat(parseFloat(row.total_qty).toFixed(3)),
      total_amount:     parseFloat(parseFloat(row.total_amount).toFixed(2)),
      total_cgst:       parseFloat(parseFloat(row.total_cgst).toFixed(2)),
      total_sgst:       parseFloat(parseFloat(row.total_sgst).toFixed(2)),
      total_igst:       parseFloat(parseFloat(row.total_igst).toFixed(2)),
      total_line_total: parseFloat(parseFloat(row.total_line_total).toFixed(2)),
      avg_rate:         parseFloat(parseFloat(row.avg_rate).toFixed(2)),
    })),
    by_client: byClient.map((row) => ({
      client_id:      row.client_id,
      client_name:    row.client_name,
      gstin:          row.gstin,
      state_code:     row.state_code,
      bill_count:     parseInt(row.bill_count),
      total_subtotal: parseFloat(parseFloat(row.total_subtotal).toFixed(2)),
      total_gst:      parseFloat(parseFloat(row.total_gst).toFixed(2)),
      total_with_gst: parseFloat(parseFloat(row.total_with_gst).toFixed(2)),
      total_pieces:   parseFloat(parseFloat(row.total_pieces).toFixed(3)),
    })),
    top_bills: topBills.map((row) => ({
      bill_no:        row.bill_no,
      bill_date:      row.bill_date,
      client_name:    row.client_name,
      subtotal:       parseFloat(parseFloat(row.subtotal).toFixed(2)),
      total_with_gst: parseFloat(parseFloat(row.total_with_gst).toFixed(2)),
      total_pieces:   parseFloat(parseFloat(row.total_pieces).toFixed(3)),
    })),
    bill_list: billList,
  }
}

// ─── 4. Attendance Report ─────────────────────────────────────

const getAttendanceReport = async (month, year) => {
  const { m, y } = validateMonthYear(month, year)

  const rows = await reportsRepository.getAttendanceSummaryForReport(m, y)

  const employeeReports = rows.map((row) => ({
    emp_code:      row.emp_code,
    employee_name: row.employee_name,
    role:          row.role,
    department:    row.department,
    ...computePayroll(row),
  }))

  // Department wise aggregation
  const byDepartment = {}
  for (const emp of employeeReports) {
    const dept = emp.department
    if (!byDepartment[dept]) {
      byDepartment[dept] = {
        department:       dept,
        employee_count:   0,
        total_present:    0,
        total_absent:     0,
        total_half_day:   0,
        total_leave:      0,
        total_payable:    0,
      }
    }
    byDepartment[dept].employee_count   += 1
    byDepartment[dept].total_present    += emp.present_count
    byDepartment[dept].total_absent     += emp.absent_count
    byDepartment[dept].total_half_day   += emp.half_day_count
    byDepartment[dept].total_leave      += emp.leave_count
    byDepartment[dept].total_payable    += emp.payable_salary
  }

  // Overall totals
  const totalPayable = employeeReports.reduce(
    (sum, e) => sum + e.payable_salary, 0
  )
  const totalPresent = employeeReports.reduce(
    (sum, e) => sum + e.present_count, 0
  )
  const totalAbsent = employeeReports.reduce(
    (sum, e) => sum + e.absent_count, 0
  )

  return {
    period:       { month: m, year: y },
    employees:    employeeReports,
    by_department: Object.values(byDepartment).map((d) => ({
      ...d,
      total_payable: parseFloat(d.total_payable.toFixed(2)),
    })),
    totals: {
      employee_count:      employeeReports.length,
      total_present_days:  totalPresent,
      total_absent_days:   totalAbsent,
      total_payable_salary: parseFloat(totalPayable.toFixed(2)),
    },
  }
}

// ─── 5. Dashboard Summary (all in one call) ───────────────────

const getDashboardSummary = async (month, year) => {
  const { m, y } = validateMonthYear(month, year)

  const [salesSummary, labourCost, byProduct, byClient] =
    await Promise.all([
      reportsRepository.getSalesSummary(m, y),
      reportsRepository.getTotalLabourCost(m, y),
      reportsRepository.getSalesByProduct(m, y),
      reportsRepository.getSalesByClient(m, y),
    ])

  const totalSales    = parseFloat(salesSummary.total_subtotal || 0)
  const totalGst      = parseFloat(salesSummary.total_gst      || 0)
  const totalWithGst  = parseFloat(salesSummary.total_with_gst || 0)
  const grossProfit   = totalSales
  const netProfit     = parseFloat((grossProfit - labourCost).toFixed(2))

  return {
    period:         { month: m, year: y },
    sales: {
      total_subtotal:  parseFloat(totalSales.toFixed(2)),
      total_gst:       parseFloat(totalGst.toFixed(2)),
      total_with_gst:  parseFloat(totalWithGst.toFixed(2)),
      confirmed_bills: parseInt(salesSummary.confirmed_bills) || 0,
      total_pieces:    parseFloat(parseFloat(salesSummary.total_pieces || 0).toFixed(3)),
    },
    profit: {
      gross_profit: parseFloat(grossProfit.toFixed(2)),
      labour_cost:  parseFloat(labourCost.toFixed(2)),
      net_profit:   netProfit,
    },
    top_products: byProduct.slice(0, 5).map((p) => ({
      product_name:  p.product_name,
      total_qty:     parseFloat(parseFloat(p.total_qty).toFixed(3)),
      total_amount:  parseFloat(parseFloat(p.total_amount).toFixed(2)),
    })),
    top_clients: byClient.slice(0, 5).map((c) => ({
      client_name:    c.client_name,
      bill_count:     parseInt(c.bill_count),
      total_with_gst: parseFloat(parseFloat(c.total_with_gst).toFixed(2)),
    })),
  }
}

module.exports = {
  getProfitAndLoss,
  getGstReconciliation,
  getSalesSummaryReport,
  getAttendanceReport,
  getDashboardSummary,
}
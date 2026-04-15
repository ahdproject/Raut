const PDFDocument = require('pdfkit')
const { Readable } = require('stream')

/**
 * Generate a professional bill PDF
 * @param {Object} billData - Bill information with all details
 * @returns {Promise<Buffer>} - PDF buffer
 */
const generateBillPDF = async (billData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
      })

      const buffers = []

      doc.on('data', (data) => buffers.push(data))
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers)
        resolve(pdfBuffer)
      })
      doc.on('error', reject)

      // Colors
      const darkBlue = '#2c3e50'
      const lightGray = '#f5f5f5'
      const black = '#000000'
      const green = '#27ae60'

      // ===== HEADER =====
      doc
        .rect(0, 0, doc.page.width, 100)
        .fill(darkBlue)

      doc
        .font('Helvetica-Bold')
        .fontSize(24)
        .fillColor('white')
        .text('RAUT INDUSTRIES', 60, 20)

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#cccccc')
        .text('W280, TTC Industrial Area, MIDC, Rabale, Navi Mumbai 400701', 60, 48)
        .text('Email: info@rautindustries.com | GST: 27AABCM9715A1ZP', 60, 62)

      doc
        .fontSize(16)
        .fillColor('white')
        .font('Helvetica-Bold')
        .text('TAX INVOICE', doc.page.width - 200, 30)

      // ===== INVOICE DETAILS =====
      doc.fillColor(black)
      const invoiceY = 110

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Invoice No:', 60, invoiceY)
        .font('Helvetica')
        .text(`#${billData.bill_no}`, 150, invoiceY)

      doc
        .font('Helvetica-Bold')
        .text('Invoice Date:', 60, invoiceY + 20)
        .font('Helvetica')
        .text(new Date(billData.bill_date).toLocaleDateString('en-IN'), 150, invoiceY + 20)

      doc
        .font('Helvetica-Bold')
        .text('Invoice Status:', 60, invoiceY + 40)
        .font('Helvetica')
        .text(billData.status?.toUpperCase() || 'DRAFT', 150, invoiceY + 40)

      // ===== BILL TO / SHIP TO =====
      const billToY = invoiceY + 70

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor(darkBlue)
        .text('BILL TO:', 60, billToY)

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor(black)
        .text(`${billData.client.name}`, 60, billToY + 20)
        .text(`State Code: ${billData.client.state_code}`, 60, billToY + 35)

      doc
        .font('Helvetica-Bold')
        .fillColor(darkBlue)
        .text('SHIP TO:', 350, billToY)

      doc
        .font('Helvetica')
        .fillColor(black)
        .text(`${billData.client.name}`, 350, billToY + 20)
        .text(`Place of Supply: ${billData.place_of_supply || 'Not specified'}`, 350, billToY + 35)

      // ===== LINE ITEMS TABLE =====
      const tableTop = billToY + 100
      const col1 = 60
      const col2 = 120
      const col3 = 200
      const col4 = 280
      const col5 = 360
      const col6 = 430
      const col7 = 500

      const rowHeight = 25
      let y = tableTop

      // Table Header
      doc
        .rect(col1 - 10, y - 5, doc.page.width - 120, rowHeight)
        .fill(lightGray)

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(black)
        .text('Sr.', col1, y, { width: 40 })
        .text('Description', col2, y, { width: 70 })
        .text('HSN', col3, y, { width: 70 })
        .text('Qty', col4, y, { width: 60 })
        .text('Rate', col5, y, { width: 60 })
        .text('Disc. %', col6, y, { width: 50 })
        .text('Amount', col7, y, { width: 70 })

      y += rowHeight + 5

      // Line Items
      let srNo = 1
      let subtotal = 0

      if (billData.line_items && billData.line_items.length > 0) {
        billData.line_items.forEach((item) => {
          const amount = (item.qty * item.rate).toFixed(2)
          subtotal += parseFloat(amount)

          doc
            .fontSize(9)
            .font('Helvetica')
            .fillColor(black)
            .text(srNo.toString(), col1, y, { width: 40 })
            .text(item.description || 'N/A', col2, y, { width: 70 })
            .text(item.hsn_code || '-', col3, y, { width: 70 })
            .text(item.qty.toString(), col4, y, { width: 60 })
            .text(`₹${item.rate.toFixed(2)}`, col5, y, { width: 60 })
            .text('0%', col6, y, { width: 50 })
            .text(`₹${amount}`, col7, y, { width: 70 })

          // Add GST details if applicable
          const cgst = (parseFloat(amount) * item.cgst_rate) / 100
          const sgst = (parseFloat(amount) * item.sgst_rate) / 100
          const igst = (parseFloat(amount) * item.igst_rate) / 100

          if (cgst > 0 || sgst > 0 || igst > 0) {
            y += 12
            doc
              .fontSize(8)
              .fillColor('#666666')
              .text(
                `CGST (${item.cgst_rate}%): ₹${cgst.toFixed(2)} | SGST (${item.sgst_rate}%): ₹${sgst.toFixed(2)} | IGST (${item.igst_rate}%): ₹${igst.toFixed(2)}`,
                col2,
                y,
                { width: 300 }
              )
          }

          y += rowHeight + 5
          srNo++
        })
      }

      // ===== OTHER CHARGES =====
      if (billData.other_charges && billData.other_charges.length > 0) {
        y += 10
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor(darkBlue)
          .text('Other Charges:', col1, y)

        y += 15
        billData.other_charges.forEach((charge) => {
          const chargeAmount = (charge.qty * charge.rate).toFixed(2)
          subtotal += parseFloat(chargeAmount)

          doc
            .fontSize(9)
            .font('Helvetica')
            .fillColor(black)
            .text(srNo.toString(), col1, y, { width: 40 })
            .text(charge.custom_name || 'Charge', col2, y, { width: 70 })
            .text('-', col3, y, { width: 70 })
            .text(charge.qty.toString(), col4, y, { width: 60 })
            .text(`₹${charge.rate.toFixed(2)}`, col5, y, { width: 60 })
            .text('0%', col6, y, { width: 50 })
            .text(`₹${chargeAmount}`, col7, y, { width: 70 })

          y += rowHeight + 5
          srNo++
        })
      }

      // ===== TOTALS SECTION =====
      y += 15

      const totalsX = 350
      const totalsLabelWidth = 120
      const totalsValueX = 500

      // Subtotal
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor(black)
        .text('Subtotal:', totalsX, y, { width: totalsLabelWidth, align: 'right' })
        .text(`₹${subtotal.toFixed(2)}`, totalsValueX, y, { width: 80, align: 'right' })

      y += 20

      // Tax
      const totalTax = billData.totals?.total_tax || 0
      doc
        .text('Total Tax:', totalsX, y, { width: totalsLabelWidth, align: 'right' })
        .text(`₹${totalTax.toFixed(2)}`, totalsValueX, y, { width: 80, align: 'right' })

      y += 20

      // Grand Total
      const grandTotal = billData.totals?.grand_total || 0
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor(green)
        .rect(totalsX - 10, y - 5, 250, 25)
        .fill(lightGray)

      doc
        .fillColor(green)
        .text('GRAND TOTAL:', totalsX, y, { width: totalsLabelWidth, align: 'right' })
        .text(`₹${grandTotal.toFixed(2)}`, totalsValueX, y, { width: 80, align: 'right' })

      // ===== AMOUNT IN WORDS =====
      y += 40
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(black)
        .text(`Amount in Words: ${numberToWords(Math.floor(grandTotal))} Rupees Only`, 60, y)

      // ===== ADDITIONAL DETAILS =====
      y += 40

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(darkBlue)
        .text('Payment Terms:', 60, y)

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(black)
        .text(billData.payment_terms || 'Net 30', 60, y + 18)

      doc
        .font('Helvetica-Bold')
        .fillColor(darkBlue)
        .text('Transport Mode:', 300, y)

      doc
        .font('Helvetica')
        .text(billData.transport_mode || 'Not specified', 300, y + 18)

      // ===== FOOTER =====
      const footerY = doc.page.height - 60

      doc
        .fontSize(9)
        .fillColor('#666666')
        .text('This is a computer-generated invoice and does not require a signature.', 60, footerY)
        .text('For any queries, please contact: info@rautindustries.com', 60, footerY + 15)
        .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 60, footerY + 30)

      // Finalize PDF
      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Convert number to words (for amount in words)
 * @param {number} num - Number to convert
 * @returns {string} - Number in words
 */
function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const scales = ['', 'Thousand', 'Lakh', 'Crore']

  if (num === 0) return 'Zero'

  let words = ''
  let scaleIndex = 0

  while (num > 0 && scaleIndex < scales.length) {
    const chunk = num % 1000
    if (chunk !== 0) {
      words = convertChunk(chunk, ones, tens) + (scales[scaleIndex] ? ' ' + scales[scaleIndex] + ' ' : ' ') + words
    }
    num = Math.floor(num / 1000)
    scaleIndex++
  }

  return words.trim()
}

function convertChunk(num, ones, tens) {
  let result = ''

  const hundreds = Math.floor(num / 100)
  const remainder = num % 100

  if (hundreds > 0) {
    result += ones[hundreds] + ' Hundred '
  }

  if (remainder >= 20) {
    result += tens[Math.floor(remainder / 10)] + ' '
    if (remainder % 10 > 0) {
      result += ones[remainder % 10]
    }
  } else if (remainder > 0) {
    result += ones[remainder]
  }

  return result.trim()
}

module.exports = {
  generateBillPDF,
}

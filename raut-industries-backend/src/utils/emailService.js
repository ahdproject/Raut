const nodemailer = require('nodemailer')
const config = require('../config/env')
const logger = require('./logger')
const { generateBillPDF } = require('./pdfGenerator')

// Create transporter
let transporter = null

const initializeTransporter = () => {
  if (transporter) return transporter

  try {
    transporter = nodemailer.createTransport({
      service: config.email.service,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    })
    logger.info('Email transporter initialized successfully')
    return transporter
  } catch (error) {
    logger.error('Failed to initialize email transporter', error)
    return null
  }
}

/**
 * Send bill creation notification to admin
 * @param {Object} billData - Bill information
 * @param {number} billData.id - Bill ID
 * @param {number} billData.bill_no - Bill number
 * @param {Object|string} billData.client - Client information or client name
 * @param {Object} billData.totals - Bill totals
 * @param {string} billData.created_by - User who created the bill
 * @param {string} billData.created_by_name - Name of user who created the bill
 * @returns {Promise<boolean>} - Success status
 */
const sendBillCreationNotification = async (billData) => {
  try {
    const transport = initializeTransporter()
    if (!transport) {
      logger.error('Email transporter not initialized')
      return false
    }

    const adminEmail = config.email.adminEmail
    if (!adminEmail) {
      logger.warn('Admin email not configured in environment')
      return false
    }

    const billUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/bills/${billData.id}`
    
    // Handle both client object and client name
    const clientName = typeof billData.client === 'object' 
      ? billData.client?.name || 'N/A'
      : billData.client || 'N/A'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
          .header { background-color: #2c3e50; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background-color: white; padding: 20px; border-radius: 0 0 8px 8px; }
          .bill-details { margin: 20px 0; border-collapse: collapse; width: 100%; }
          .bill-details td { padding: 10px; border-bottom: 1px solid #ddd; }
          .bill-details .label { font-weight: bold; width: 40%; }
          .amount { color: #27ae60; font-weight: bold; font-size: 16px; }
          .button { display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 New Bill Created</h1>
          </div>
          <div class="content">
            <p>Hello Admin,</p>
            <p>A new bill has been created in the system. Please review the details below:</p>
            
            <table class="bill-details">
              <tr>
                <td class="label">Bill Number:</td>
                <td>#${billData.bill_no}</td>
              </tr>
              <tr>
                <td class="label">Client Name:</td>
                <td>${clientName}</td>
              </tr>
              <tr>
                <td class="label">Bill Date:</td>
                <td>${new Date(billData.bill_date).toLocaleDateString('en-IN')}</td>
              </tr>
              <tr>
                <td class="label">Created By:</td>
                <td>${billData.created_by_name || 'User'}</td>
              </tr>
              <tr>
                <td class="label">Total Amount:</td>
                <td class="amount">₹${(billData.totals?.grand_total || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td class="label">Tax (CGST + SGST/IGST):</td>
                <td>₹${(billData.totals?.total_tax || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td class="label">Status:</td>
                <td><strong>${billData.status || 'Draft'}</strong></td>
              </tr>
            </table>

            <p style="margin-top: 20px;">
              <a href="${billUrl}" class="button">View Bill Details</a>
            </p>

            <div class="footer">
              <p>This is an automated notification from Raut Industries System.</p>
              <p>Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const mailOptions = {
      from: `${config.email.senderName} <${config.email.user}>`,
      to: adminEmail,
      subject: `New Bill Created - Bill #${billData.bill_no}`,
      html: htmlContent,
      attachments: [],
    }

    // Generate PDF
    let pdfBuffer = null
    try {
      pdfBuffer = await generateBillPDF(billData)
    } catch (pdfError) {
      logger.error('Failed to generate PDF:', pdfError)
      // Continue without PDF if generation fails
    }

    // Add PDF attachment if generated successfully
    if (pdfBuffer) {
      mailOptions.attachments.push({
        filename: `Bill_${billData.bill_no}_${new Date().getTime()}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      })
    }

    const info = await transport.sendMail(mailOptions)
    logger.info(`Bill creation notification sent successfully. Message ID: ${info.messageId}${pdfBuffer ? ' (with PDF)' : ''}`)
    return true
  } catch (error) {
    logger.error('Failed to send bill creation notification email', error)
    return false
  }
}

/**
 * Send test email to verify configuration
 * @param {string} toEmail - Recipient email
 * @returns {Promise<boolean>} - Success status
 */
const sendTestEmail = async (toEmail) => {
  try {
    const transport = initializeTransporter()
    if (!transport) {
      logger.error('Email transporter not initialized')
      return false
    }

    const mailOptions = {
      from: `${config.email.senderName} <${config.email.user}>`,
      to: toEmail,
      subject: 'Test Email from Raut Industries',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify your email configuration is working correctly.</p>
        <p>If you received this email, your email settings are properly configured!</p>
      `,
    }

    const info = await transport.sendMail(mailOptions)
    logger.info(`Test email sent successfully to ${toEmail}. Message ID: ${info.messageId}`)
    return true
  } catch (error) {
    logger.error('Failed to send test email', error)
    return false
  }
}

module.exports = {
  sendBillCreationNotification,
  sendTestEmail,
  initializeTransporter,
}

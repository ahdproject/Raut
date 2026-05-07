const config = require('../config/env')
const logger = require('./logger')
const { generateBillPDF, generateReportPDF } = require('./pdfGenerator')
const axios = require('axios')

// Brevo API endpoint
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
const BREVO_API_KEY = process.env.BREVO_API_KEY

/**
 * Send email using Brevo API
 * @param {Object} mailOptions - Mail configuration
 * @returns {Promise<Object>} - Response from Brevo
 */
const sendEmailViaBrevo = async (mailOptions) => {
  try {
    if (!BREVO_API_KEY) {
      logger.error('Brevo API key not configured')
      throw new Error('BREVO_API_KEY not configured')
    }

    const payload = {
      sender: {
        name: mailOptions.from.name || config.email.senderName,
        email: mailOptions.from.email || config.email.user,
      },
      to: Array.isArray(mailOptions.to) 
        ? mailOptions.to.map(email => ({ email }))
        : [{ email: mailOptions.to }],
      subject: mailOptions.subject,
      htmlContent: mailOptions.html,
    }

    // Add attachments if provided
    if (mailOptions.attachments && mailOptions.attachments.length > 0) {
      payload.attachment = mailOptions.attachments.map(att => ({
        name: att.filename,
        content: att.content.toString('base64'),
        contentType: att.contentType,
      }))
    }

    const response = await axios.post(BREVO_API_URL, payload, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    logger.info('Email sent via Brevo successfully', { messageId: response.data.messageId })
    return response.data
  } catch (error) {
    logger.error('Failed to send email via Brevo', error.response?.data || error.message)
    throw error
  }
}

/**
 * Send bill creation notification to admin
 * @param {Object} billData - Bill information
 * @returns {Promise<boolean>} - Success status
 */
const sendBillCreationNotification = async (billData) => {
  try {
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
      from: {
        name: config.email.senderName,
        email: config.email.user,
      },
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

    await sendEmailViaBrevo(mailOptions)
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
    const mailOptions = {
      from: {
        name: config.email.senderName,
        email: config.email.user,
      },
      to: toEmail,
      subject: 'Test Email from Raut Industries',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify your email configuration is working correctly.</p>
        <p>If you received this email, your email settings are properly configured!</p>
      `,
    }

    await sendEmailViaBrevo(mailOptions)
    return true
  } catch (error) {
    logger.error('Failed to send test email', error)
    return false
  }
}

/**
 * Send report via email
 * @param {Object} options - Email options
 * @param {string} options.recipientEmail - Recipient email address
 * @param {string} options.reportName - Name of the report
 * @param {string} options.reportType - Type of report (pnl, gst, sales, attendance)
 * @param {Object} options.reportData - Report data to send
 * @param {Buffer} options.pdfBuffer - PDF buffer of the report
 * @returns {Promise<boolean>} - Success status
 */
const sendReportEmail = async (options) => {
  try {
    const { recipientEmail, reportName, reportType, reportData, pdfBuffer } = options

    if (!recipientEmail) {
      throw new Error('Recipient email is required')
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
          .header { background-color: #2c3e50; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background-color: white; padding: 20px; border-radius: 0 0 8px 8px; }
          .report-details { margin: 20px 0; border-collapse: collapse; width: 100%; }
          .report-details td { padding: 10px; border-bottom: 1px solid #ddd; }
          .report-details .label { font-weight: bold; width: 40%; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 ${reportName}</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Please find attached your requested report: <strong>${reportName}</strong></p>
            
            <table class="report-details">
              <tr>
                <td class="label">Report Type:</td>
                <td>${reportType.toUpperCase()}</td>
              </tr>
              <tr>
                <td class="label">Generated On:</td>
                <td>${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}</td>
              </tr>
            </table>

            <div class="footer">
              <p>This is an automated report from Raut Industries System.</p>
              <p>Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const mailOptions = {
      from: {
        name: config.email.senderName,
        email: config.email.user,
      },
      to: recipientEmail,
      subject: `Report: ${reportName} - ${new Date().toLocaleDateString('en-IN')}`,
      html: htmlContent,
      attachments: [],
    }

    // Add PDF attachment if provided
    if (pdfBuffer) {
      mailOptions.attachments.push({
        filename: `${reportName}_${new Date().getTime()}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      })
    }

    await sendEmailViaBrevo(mailOptions)
    logger.info(`Report email sent successfully to ${recipientEmail}`)
    return true
  } catch (error) {
    logger.error('Failed to send report email', error)
    throw error
  }
}

module.exports = {
  sendBillCreationNotification,
  sendTestEmail,
  sendReportEmail,
}

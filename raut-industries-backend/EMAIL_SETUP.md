# Email Notification Setup Guide

This guide explains how to set up email notifications for bill creation in Raut Industries Backend.

## Overview

The backend now sends automated email notifications to the admin whenever a new bill is created. The email includes:
- Bill number
- Client name and details
- Bill date
- Created by (user who created the bill)
- Total amount and tax details
- Direct link to view the bill

## Prerequisites

### 1. Gmail Account Setup

To use Gmail as your email service provider (free), follow these steps:

#### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication if not already enabled
3. Verify your phone number

#### Step 2: Generate App Password
1. Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer" (or your device)
3. Click "Generate"
4. Google will show a 16-character password
5. **Copy this password** - you'll need it for the `.env` file

### 2. Install Dependencies

```bash
npm install
```

This will install nodemailer (already added to package.json).

## Configuration

### 1. Create `.env` file

Create a `.env` file in the root of the backend project and add:

```bash
# Email Configuration (Gmail with App Password)
EMAIL_SERVICE=gmail
EMAIL_USER=devanshudandekar5@gmail.com
EMAIL_PASSWORD=your_app_specific_password
ADMIN_EMAIL=devanshudandekar5@gmail.com
EMAIL_SENDER_NAME=Raut Industries

# Other existing configurations
PORT=8000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=RautIndustries
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
COMPANY_STATE_CODE=27
FRONTEND_URL=http://localhost:5173
```

**Replace:**
- `devanshudandekar5@gmail.com` - Your Gmail address
- `your_app_specific_password` - The 16-character password you generated above

### 2. Verify Configuration

The email configuration is loaded in `src/config/env.js`:

```javascript
email: {
  service: process.env.EMAIL_SERVICE || 'gmail',
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  adminEmail: process.env.ADMIN_EMAIL,
  senderName: process.env.EMAIL_SENDER_NAME || 'Raut Industries',
}
```

## Files Added/Modified

### New Files
- `src/utils/emailService.js` - Email service utility for sending emails

### Modified Files
- `package.json` - Added nodemailer dependency
- `src/config/env.js` - Added email configuration variables
- `.env.example` - Added email configuration template
- `src/modules/bills/bills.service.js` - Integrated email notification on bill creation
- `src/modules/bills/bills.controller.js` - Added test email endpoint
- `src/modules/bills/bills.routes.js` - Added test email route

## API Endpoints

### Test Email Endpoint

**Send a test email to verify your configuration:**

```http
POST /api/bills/test-email
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "email": "devanshudandekar5@gmail.com"
}
```

**Response on success:**
```json
{
  "success": true,
  "data": { "sent": true },
  "message": "Test email sent successfully"
}
```

**Response on failure:**
```json
{
  "success": false,
  "message": "Failed to send test email. Please check email configuration."
}
```

### Bill Creation (Auto Email)

When you create a bill via:

```http
POST /api/bills
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "bill_date": "2024-03-31",
  "client_id": 1,
  "line_items": [...],
  "other_charges": [...],
  ...
}
```

An email is automatically sent to the admin email configured in `.env`.

**Note:** Email sending is non-blocking - if email fails, the bill will still be created successfully.

## Troubleshooting

### Issue: "Invalid login credentials"
- **Solution:** Verify your Gmail address and app password are correct in `.env`
- Ensure 2FA is enabled on your Gmail account
- Generate a new app password and try again

### Issue: "Less secure app access"
- **Solution:** This error occurs if you didn't generate an app password
- Follow the "Generate App Password" steps above
- Use the app password, NOT your regular Gmail password

### Issue: Email not received
- Check the console logs for error messages
- Verify admin email in `.env` is correct
- Check spam folder
- Ensure `NODE_ENV` is not `production` without proper SMTP configuration

### Issue: "ECONNREFUSED" or connection errors
- This typically means Gmail SMTP connection failed
- Verify internet connection
- Check firewall settings (port 587 should be open)
- Verify EMAIL_SERVICE is set to `gmail`

## Testing in Development

1. **Start the backend:**
```bash
npm run dev
```

2. **Generate JWT token** - Login to get an auth token from `/api/auth/login`

3. **Test email endpoint:**
```bash
curl -X POST http://localhost:8000/api/bills/test-email \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"devanshudandekar5@gmail.com"}'
```

4. **Check your inbox** - You should receive a test email within a few seconds

5. **Create a bill** - The bill creation endpoint will automatically send an email to your admin email

## Email Features

### Automatic Bill Creation Email
- Sent to admin when a new bill is created
- Includes all bill details and totals
- Contains a direct link to view the bill
- Professional HTML formatting with company branding

### Test Email
- Verify configuration before going live
- Send to any email address
- Admin-only access
- Useful for debugging

## Production Recommendations

1. **Use environment-specific emails:**
   - Development: Send to test email
   - Production: Send to actual admin email

2. **Monitor email delivery:**
   - Check server logs for email sending errors
   - Gmail has a daily sending limit (~2,000 emails/day)

3. **Alternative SMTP Providers:**
   - If Gmail limits are reached, consider:
     - SendGrid (free tier available)
     - Mailgun (free tier available)
     - Amazon SES
     - Office 365/Outlook

4. **Email Logging:**
   - Emails are logged using Winston logger
   - Check logs for delivery confirmation

## Security Notes

- ⚠️ Never commit `.env` file to version control
- Store app passwords securely
- Rotate app passwords periodically
- Use different email accounts for dev/prod
- Never share your app password

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs in `logs/` directory
3. Verify all `.env` variables are set correctly
4. Test with the `/api/bills/test-email` endpoint first

---

**Email Service Version:** 1.0  
**Last Updated:** March 31, 2026

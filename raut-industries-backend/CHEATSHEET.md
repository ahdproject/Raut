# 🚀 Developer Cheat Sheet - Email Notifications

## Quick Reference

### Installation
```bash
npm install nodemailer@^6.9.7
```

### Environment Variables
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=devanshudandekar5@gmail.com
EMAIL_PASSWORD=xxxx_xxxx_xxxx_xxxx
ADMIN_EMAIL=devanshudandekar5@gmail.com
EMAIL_SENDER_NAME=Raut Industries
FRONTEND_URL=http://localhost:5173
```

---

## Common Tasks

### Send Test Email
```bash
curl -X POST http://localhost:8000/api/bills/test-email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Start Backend
```bash
npm run dev
```

### Check Dependencies
```bash
npm list nodemailer
```

### View Email Service
```bash
cat src/utils/emailService.js
```

---

## Email Service API

### Send Bill Creation Email
```javascript
const emailService = require('../../utils/emailService')

const billData = {
  id: 123,
  bill_no: 456,
  bill_date: '2024-03-31',
  client: { name: 'ABC Corp', state_code: '27' },
  totals: { grand_total: 5000, total_tax: 500 },
  created_by_name: 'John Manager',
  status: 'draft'
}

// Non-blocking send
emailService.sendBillCreationNotification(billData)
  .catch(err => console.error('Email error:', err))
```

### Send Test Email
```javascript
const result = await emailService.sendTestEmail('admin@example.com')
console.log(result) // true or false
```

### Access Configuration
```javascript
const config = require('../../config/env')
console.log(config.email.adminEmail)
console.log(config.email.senderName)
```

---

## Troubleshooting

### Email Not Sending?
```
1. Check .env file exists
2. Verify EMAIL_PASSWORD is 16 characters
3. Test endpoint: POST /api/bills/test-email
4. Check console logs for errors
5. Verify EMAIL_USER and EMAIL_PASSWORD are correct
```

### Gmail Authentication Error
```
1. Go to: https://myaccount.google.com/apppasswords
2. Select Mail + Windows Computer
3. Generate new app password
4. Copy 16-character password
5. Update EMAIL_PASSWORD in .env
```

### Port 587 Blocked?
```
1. Check firewall settings
2. Try different network
3. Contact network administrator
4. Alternative: Use different email provider
```

---

## File Locations

| What | Where |
|------|-------|
| Email Service | `src/utils/emailService.js` |
| Bill Service | `src/modules/bills/bills.service.js` |
| Bill Controller | `src/modules/bills/bills.controller.js` |
| Bill Routes | `src/modules/bills/bills.routes.js` |
| Config | `src/config/env.js` |
| .env Example | `.env.example` |

---

## Code Snippets

### Import Email Service
```javascript
const emailService = require('../../utils/emailService')
```

### Use in Service
```javascript
// Send email asynchronously (non-blocking)
emailService.sendBillCreationNotification({
  ...bill,
  created_by_name: user?.name || 'User',
}).catch((err) => {
  console.error('Error sending bill creation email:', err)
})
```

### Access Email Config
```javascript
const config = require('../../config/env')

const {
  service,
  user,
  password,
  adminEmail,
  senderName
} = config.email
```

### Check if Email is Configured
```javascript
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn('Email service not configured')
  return
}
```

---

## Testing Commands

### Test 1: Send Test Email
```bash
curl -X POST http://localhost:8000/api/bills/test-email \
  -H "Authorization: Bearer $(node -e "console.log('PASTE_YOUR_TOKEN_HERE')")" \
  -H "Content-Type: application/json" \
  -d '{"email":"your_email@gmail.com"}'
```

### Test 2: Create Bill
```bash
curl -X POST http://localhost:8000/api/bills \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bill_date": "2024-03-31",
    "client_id": 1,
    "line_items": [{"product_id": 1, "qty": 1, "rate": 100}]
  }'
```

### Test 3: Check Node Modules
```bash
ls -la node_modules/nodemailer
```

---

## Environment Setup

### macOS/Linux
```bash
# Create .env file
cat > .env << EOF
EMAIL_SERVICE=gmail
EMAIL_USER=devanshudandekar5@gmail.com
EMAIL_PASSWORD=xxxx_xxxx_xxxx_xxxx
ADMIN_EMAIL=devanshudandekar5@gmail.com
EMAIL_SENDER_NAME=Raut Industries
PORT=8000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=RautIndustries
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EOF
```

### Verify .env
```bash
cat .env
```

---

## Debugging

### Enable Email Logs
```javascript
// In emailService.js
logger.info('Email config:', config.email.user)
logger.info('Attempting to send to:', adminEmail)
logger.info('Message ID:', info.messageId)
```

### Check Transporter
```javascript
const transport = initializeTransporter()
console.log('Transporter ready:', !!transport)
```

### List Transporter Details
```javascript
const config = require('../../config/env')
console.log('Email Service:', config.email.service)
console.log('Email User:', config.email.user)
console.log('Admin Email:', config.email.adminEmail)
```

---

## Best Practices

✅ **DO:**
- Always use `.env` for credentials
- Test email config before deployment
- Log email errors for debugging
- Use non-blocking email sends
- Add error handling
- Document email changes

❌ **DON'T:**
- Hardcode email passwords
- Use regular Gmail password (use app password)
- Block bill creation on email failure
- Send synchronously (use async/await with catch)
- Expose email errors to frontend
- Commit .env file to git

---

## Common Errors & Solutions

```
Error: Invalid login credentials
Solution: Use app password, not Gmail password

Error: connect ECONNREFUSED 127.0.0.1:587
Solution: Check internet connection, verify EMAIL_SERVICE=gmail

Error: PROTOCOL:SMTP:MissingCredentials
Solution: Verify EMAIL_USER and EMAIL_PASSWORD in .env

Error: Timeout
Solution: Check Gmail account 2FA is enabled

Error: Email not received
Solution: Check spam folder, verify admin email correct
```

---

## Performance Tips

- ✅ Transporter is cached (created once)
- ✅ Email sending is non-blocking (async)
- ✅ HTML is generated inline (no file I/O)
- ✅ No database queries in email service
- ✅ Errors don't block bill creation

---

## Future Enhancements

```
[ ] Add email queue (Bull/RabbitMQ)
[ ] Add email retry logic
[ ] Send bills as PDF attachment
[ ] Send to client email too
[ ] Email templates database
[ ] Email tracking (opens/clicks)
[ ] Batch email sending
[ ] Multiple admin emails
[ ] Email scheduling
[ ] SMS notifications
```

---

## Resources

📖 **Documentation:**
- QUICKSTART.md - Fast setup
- EMAIL_SETUP.md - Complete guide
- ARCHITECTURE.md - System design

🌐 **External:**
- Nodemailer: https://nodemailer.com/
- Gmail Setup: https://support.google.com/mail/answer/7126229
- Gmail App Password: https://myaccount.google.com/apppasswords

---

## Contact & Support

- **Email Service:** `src/utils/emailService.js`
- **Issues:** Check server logs
- **Test:** Use `/api/bills/test-email` endpoint
- **Config:** Update `.env` file

---

## Version Info

- Nodemailer: 6.9.7
- Express: 5.1.0
- Node.js: 14+ (recommended)
- Tested: March 31, 2026

---

**Keep this handy! 📌**

Print this sheet or bookmark it for quick reference during development.

Happy coding! 🚀

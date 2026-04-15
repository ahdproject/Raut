# 🔧 Email Not Received - Troubleshooting Guide

## ✅ Issue Fixed!

The error was: `Cannot read properties of undefined (reading 'name')`

This has been fixed in the latest update. The email service now properly handles the client data.

---

## 🔄 What Was Fixed

### Before (❌ Error)
```javascript
const htmlContent = `...${billData.client.name}...`
// Error: billData.client was undefined
```

### After (✅ Fixed)
```javascript
const clientName = typeof billData.client === 'object' 
  ? billData.client?.name || 'N/A'
  : billData.client || 'N/A'

// Safe access with fallback
```

---

## 📋 Verification Checklist

Run this script to verify everything is configured:

```bash
./test-email-config.sh
```

Expected output:
```
✅ .env file found
✅ Backend is running
✅ nodemailer is installed
✅ emailService.js found
✅ bills.service.js has email integration
✅ All configuration checks passed!
```

---

## 🧪 Step-by-Step Testing

### Step 1: Verify Backend is Running
```bash
curl http://localhost:8000/health
```
Expected: `{"status":"ok","project":"Raut Industries"}`

### Step 2: Test Email Configuration with Test Endpoint

First, login to get a JWT token:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'
```

Then use the token to test email:
```bash
curl -X POST http://localhost:8000/api/bills/test-email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"devanshudandekar5@gmail.com"}'
```

Expected response:
```json
{
  "success": true,
  "data": { "sent": true },
  "message": "Test email sent successfully"
}
```

### Step 3: Check Server Logs

Look for these messages:
```
✅ Email transporter initialized successfully
✅ Email sent successfully. Message ID: <id>
```

Or errors:
```
❌ Failed to send bill creation notification email
❌ Error in email notification process
```

---

## 🔍 Common Issues & Solutions

### Issue 1: "Email transporter initialized successfully" but email not sent

**Solution:**
1. Check ADMIN_EMAIL in .env
2. Verify EMAIL_PASSWORD is 16 characters
3. Ensure 2FA is enabled on Gmail
4. Check Gmail's "Less secure app access" (shouldn't apply with app password)

### Issue 2: "Cannot read properties of undefined"

**Solution:** ✅ FIXED - Update to latest code

Run:
```bash
git pull  # Or manually update files
npm install
npm run dev
```

### Issue 3: ECONNREFUSED (Connection refused)

**Solution:**
1. Check internet connection
2. Verify firewall isn't blocking port 587
3. Try on different network
4. Check EMAIL_SERVICE=gmail in .env

### Issue 4: EAUTH (Authentication failed)

**Solution:**
1. Go to https://myaccount.google.com/apppasswords
2. Verify 2FA is enabled
3. Generate NEW app password
4. Use 16-character password (no spaces)
5. Update EMAIL_PASSWORD in .env
6. Restart backend: `npm run dev`

### Issue 5: Email sends but recipient doesn't receive

**Solution:**
1. Check spam/junk folder
2. Verify ADMIN_EMAIL is correct
3. Add admin email to contacts
4. Whitelist sender email
5. Check if Gmail is blocking

---

## 📧 Test Email Endpoint

This endpoint allows you to test if email configuration works:

```bash
POST /api/bills/test-email
Authorization: Bearer {jwt_token}

{
  "email": "your_test_email@gmail.com"
}
```

**Success (200):**
```json
{
  "success": true,
  "data": { "sent": true },
  "message": "Test email sent successfully"
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Failed to send test email. Please check email configuration."
}
```

---

## 🚀 Full Email Flow (After Fix)

```
1. Create Bill
   ↓
2. Bill saved to database
   ↓
3. Fetch bill with getBillById()
   ↓
4. Fetch client data ✅ (NOW FIXED)
   ↓
5. Fetch created_by user data
   ↓
6. Call emailService.sendBillCreationNotification()
   ↓
7. Initialize Gmail SMTP transporter
   ↓
8. Format HTML email with client name
   ↓
9. Send to ADMIN_EMAIL
   ↓
10. Return bill to user (non-blocking)
   ↓
11. Email sent in background ✅
```

---

## 📝 Files Fixed

| File | Change |
|------|--------|
| `src/utils/emailService.js` | Added null-safe client name access |
| `src/modules/bills/bills.service.js` | Added client data fetching before email |

---

## ✨ Now Try This

1. **Create a bill** via the API
2. **Check your inbox** (devanshudandekar5@gmail.com)
3. **Verify email received** with:
   - Bill number
   - Client name (should now show correctly)
   - Total amount
   - View bill link

---

## 🧪 Quick Debug Commands

### Check environment variables
```bash
cat .env | grep EMAIL
```

### Check if process is running
```bash
ps aux | grep node
```

### Restart backend
```bash
pkill -f "node\|nodemon"
npm run dev
```

### Check logs for errors
```bash
# Look for "ERROR:" in console output
npm run dev 2>&1 | grep ERROR
```

### Test SMTP directly
```bash
# If you want to test Gmail SMTP directly
telnet smtp.gmail.com 587
```

---

## 🎯 Expected Results

### After Creating a Bill

**In Server Logs:**
```
[2026-03-31 14:23:33] INFO: Email transporter initialized successfully
[2026-03-31 14:23:34] INFO: Bill creation notification sent successfully. Message ID: <id@gmail.com>
```

**In Your Email Inbox:**
```
From: Raut Industries <devanshudandekar5@gmail.com>
To: devanshudandekar5@gmail.com
Subject: New Bill Created - Bill #123

Content includes:
- Bill Number: #123
- Client Name: ABC Corp (NOW FIXED ✅)
- Bill Date: 31-03-2026
- Created By: John Manager
- Total Amount: ₹5,000.00
- Tax: ₹500.00
- Status: draft
- View Bill Link: [CLICK HERE]
```

---

## 📞 Still Having Issues?

1. **Verify .env file:**
   ```bash
   cat .env | grep -E "EMAIL|ADMIN"
   ```

2. **Check backend is running:**
   ```bash
   curl http://localhost:8000/health
   ```

3. **Test email endpoint:**
   ```bash
   curl -X POST http://localhost:8000/api/bills/test-email \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@gmail.com"}'
   ```

4. **Check logs for specific error:**
   ```bash
   npm run dev 2>&1 | grep -i "email\|error"
   ```

5. **Verify Gmail app password:**
   - https://myaccount.google.com/apppasswords
   - Should be 16 characters without spaces
   - Should be copied exactly to EMAIL_PASSWORD

---

## ✅ Verification Done!

```
✅ Bug fixed - client data null check added
✅ Email service updated - safe property access
✅ Bills service updated - client fetching added
✅ Backend running - ready for testing
✅ Configuration verified - all checks passed
```

**You're all set! Create a bill and check your email. 🎉**

---

**Last Updated:** March 31, 2026  
**Status:** ✅ RESOLVED

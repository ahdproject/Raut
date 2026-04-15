# ⚡ Quick Start Guide - Email Notifications

## 🎯 5-Minute Setup

### Step 1: Get Gmail App Password (2 minutes)

1. Open: https://myaccount.google.com/apppasswords
2. Select **Mail** → **Windows Computer**
3. Click **Generate**
4. Copy the 16-character password

### Step 2: Create `.env` File (1 minute)

Create file `/Users/devanshu/Desktop/Raut/raut-industries-backend/.env`:

```bash
# Database
PORT=8000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=RautIndustries
DB_USER=postgres
DB_PASSWORD=yourpassword

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Email Setup
EMAIL_SERVICE=gmail
EMAIL_USER=devanshudandekar5@gmail.com
EMAIL_PASSWORD=your_app_specific_password
ADMIN_EMAIL=devanshudandekar5@gmail.com
EMAIL_SENDER_NAME=Raut Industries

# Other
NODE_ENV=development
COMPANY_STATE_CODE=27
FRONTEND_URL=http://localhost:5173
```

**⚠️ Replace `your_app_specific_password` with the 16-character password from Step 1**

### Step 3: Install Dependencies (1 minute)

```bash
cd /Users/devanshu/Desktop/Raut/raut-industries-backend
npm install
```

### Step 4: Start Backend (1 minute)

```bash
npm run dev
```

---

## ✅ Verification

### Test 1: Send Test Email

```bash
# Get JWT Token first (login to /api/auth/login)

curl -X POST http://localhost:8000/api/bills/test-email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"devanshudandekar5@gmail.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": { "sent": true },
  "message": "Test email sent successfully"
}
```

✅ Check your Gmail inbox - you should receive the test email!

### Test 2: Create a Bill

```bash
curl -X POST http://localhost:8000/api/bills \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bill_date": "2024-03-31",
    "client_id": 1,
    "line_items": [
      {
        "product_id": 1,
        "qty": 5,
        "rate": 100
      }
    ]
  }'
```

✅ Bill created - check Gmail inbox for notification email!

---

## 📧 Email Templates

### Test Email
```
Subject: Test Email from Raut Industries
This is a test email to verify your email configuration is working correctly.
If you received this email, your email settings are properly configured!
```

### Bill Creation Email
```
Subject: New Bill Created - Bill #123

Bill Details:
- Bill Number: #123
- Client: ABC Enterprises
- Bill Date: 31/03/2024
- Created By: John Manager
- Total Amount: ₹5,000.00
- Tax: ₹500.00

View Bill → [Link to Frontend]
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Invalid login credentials" | Use **app password**, not Gmail password |
| "Email not received" | Check spam folder |
| "Error: transporter is not initialized" | Verify EMAIL_USER & EMAIL_PASSWORD in .env |
| "Connection refused" | Check internet connection |

---

## 📚 More Info

- **Full Setup Guide:** `EMAIL_SETUP.md`
- **Architecture:** `ARCHITECTURE.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`

---

## ✨ What Happens Now

When you **create a bill**:
1. ✅ Bill is saved to database
2. ✅ Email is sent to admin automatically
3. ✅ Email includes all bill details with a link
4. ✅ If email fails, bill is still created (graceful degradation)

---

**Ready?** Start with Step 1 and you'll be done in 5 minutes! 🚀

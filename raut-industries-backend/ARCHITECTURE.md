# Email Notification Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│                  Create Bill Form                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                    POST /api/bills
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              Backend (Express.js)                           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  bills.controller.js                                 │  │
│  │  - Validate request body                             │  │
│  │  - Call bills.service.createBill()                   │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │                                   │
│  ┌──────────────────────▼───────────────────────────────┐  │
│  │  bills.service.js                                    │  │
│  │  - Resolve client, products, charges                 │  │
│  │  - Calculate line items & totals                     │  │
│  │  - Insert bill into database                         │  │
│  │  - Trigger email notification (async)                │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │                                   │
│                    ┌────┴────┐                              │
│                    │          │                              │
│         ┌──────────▼──┐  ┌───▼─────────────┐               │
│         │ Return Bill │  │ Send Email      │               │
│         │ to Client   │  │ (Non-blocking)  │               │
│         └─────────────┘  └───┬─────────────┘               │
│                               │                              │
│  ┌────────────────────────────▼───────────────────────┐    │
│  │  emailService.js                                   │    │
│  │  - Initialize nodemailer transporter               │    │
│  │  - Format HTML email with bill details             │    │
│  │  - Send via Gmail SMTP                             │    │
│  │  - Log result                                       │    │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            │ SMTP (Port 587)
                            │
            ┌───────────────▼──────────────┐
            │   Gmail SMTP Server          │
            │   (Google)                   │
            └───────────────┬──────────────┘
                            │
                            │ Email
                            │
            ┌───────────────▼──────────────┐
            │   Admin Inbox                │
            │   devanshudandekar5@         │
            │   gmail.com                  │
            └──────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────────────────┐
│   Bill Creation Request  │
│                          │
│ - client_id: 1           │
│ - bill_date: "2024-03-31"│
│ - line_items: [...]      │
│ - other_charges: [...]   │
└──────────────┬───────────┘
               │
               ▼
    ┌─────────────────────┐
    │  Validate Request   │
    │  - Schema check     │
    │  - Auth token check │
    └──────────┬──────────┘
               │
               ▼
    ┌──────────────────────────┐
    │  Resolve Dependencies    │
    │  - Fetch client          │
    │  - Fetch products        │
    │  - Fetch charge types    │
    │  - Calculate totals      │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │  Create Bill in DB       │
    │  - Insert bill           │
    │  - Insert line items     │
    │  - Insert other charges  │
    │  - Get bill_no           │
    └──────────┬───────────────┘
               │
               ├─────────────────────────┐
               │                         │
               ▼                         ▼
    ┌──────────────────┐    ┌───────────────────────┐
    │ Return Success   │    │  Send Email to Admin  │
    │ Response         │    │  (Async/Non-blocking) │
    │                  │    │                       │
    │ - Bill ID        │    │  - Get bill details   │
    │ - Bill number    │    │  - Format HTML        │
    │ - Totals         │    │  - Initialize SMTP    │
    │ - Status         │    │  - Send email         │
    └──────────────────┘    │  - Log result         │
                            └───────────────────────┘
                                      │
                                      ▼
                            ┌─────────────────────┐
                            │  Gmail SMTP Server  │
                            │  Authenticates &    │
                            │  Sends to Admin     │
                            └─────────────────────┘
```

## Email Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   emailService.js                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  sendBillCreationNotification(billData)              │   │
│  │                                                      │   │
│  │  Steps:                                              │   │
│  │  1. Initialize transporter (Gmail SMTP)             │   │
│  │  2. Get admin email from config                      │   │
│  │  3. Format HTML email template with:                │   │
│  │     - Bill number                                    │   │
│  │     - Client name                                    │   │
│  │     - Bill date                                      │   │
│  │     - Created by user                                │   │
│  │     - Totals and tax breakdown                       │   │
│  │     - Direct link to bill                            │   │
│  │  4. Send via SMTP                                    │   │
│  │  5. Log result                                       │   │
│  │  6. Return success/failure                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  sendTestEmail(toEmail)                              │   │
│  │                                                      │   │
│  │  Steps:                                              │   │
│  │  1. Initialize transporter                           │   │
│  │  2. Format test email HTML                           │   │
│  │  3. Send to specified email                          │   │
│  │  4. Log result                                       │   │
│  │  5. Return success/failure                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  initializeTransporter()                             │   │
│  │                                                      │   │
│  │  Initializes nodemailer transporter with:            │   │
│  │  - Service: Gmail                                    │   │
│  │  - Auth: Email user + app password                   │   │
│  │  - Caches transporter instance                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Configuration Flow

```
┌──────────────────────────┐
│    Project Root          │
│                          │
│  .env (environment vars) │
└──────────────┬───────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  src/config/env.js                       │
│                                          │
│  Reads from .env:                        │
│  - EMAIL_SERVICE (gmail)                 │
│  - EMAIL_USER (account email)            │
│  - EMAIL_PASSWORD (app password)         │
│  - ADMIN_EMAIL (recipient)               │
│  - EMAIL_SENDER_NAME (display name)      │
│  - FRONTEND_URL (for bill links)         │
│                                          │
│  Exports as:                             │
│  module.exports.email = {                │
│    service,                              │
│    user,                                 │
│    password,                             │
│    adminEmail,                           │
│    senderName                            │
│  }                                       │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  emailService.js                         │
│                                          │
│  Uses config.email to:                   │
│  - Create SMTP transporter               │
│  - Set sender name and email             │
│  - Set recipient (admin)                 │
│  - Create mail options                   │
│  - Send via Gmail                        │
└──────────────────────────────────────────┘
```

## Test Email Endpoint Flow

```
Frontend/Postman
       │
       │ POST /api/bills/test-email
       │ { email: "test@gmail.com" }
       │
       ▼
┌─────────────────────────────────────────┐
│  bills.controller.js                    │
│  sendTestEmail()                         │
│                                         │
│  1. Check if user is Admin/SuperAdmin   │
│  2. Validate email provided              │
│  3. Call emailService.sendTestEmail()   │
│  4. Return success/error response       │
└────────────────┬────────────────────────┘
                 │
                 ▼
    ┌─────────────────────────────┐
    │  emailService.sendTestEmail()│
    │                             │
    │  1. Init transporter        │
    │  2. Format test email       │
    │  3. Send to provided email  │
    │  4. Log result              │
    │  5. Return boolean          │
    └────────────┬────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
    SUCCESS          FAILURE
        │                 │
        ▼                 ▼
    Returns true      Returns false
    Email sent        Error logged
```

## Nodemailer Configuration

```
┌──────────────────────────────────────────────┐
│        Nodemailer Transporter Setup          │
├──────────────────────────────────────────────┤
│                                              │
│  Service: gmail                              │
│  Protocol: SMTP                              │
│  Host: smtp.gmail.com                        │
│  Port: 587                                   │
│                                              │
│  Authentication:                             │
│  ├─ User: EMAIL_USER (from .env)             │
│  └─ Pass: EMAIL_PASSWORD (app password)      │
│                                              │
│  Mail Options:                               │
│  ├─ From: "Raut Industries <email>"          │
│  ├─ To: ADMIN_EMAIL                          │
│  ├─ Subject: "New Bill Created - Bill #XXX"  │
│  └─ Html: formatted HTML email               │
│                                              │
└──────────────────────────────────────────────┘
```

## Error Handling Flow

```
sendBillCreationNotification()
        │
        ├─→ Transporter init fails
        │   └─→ Log error
        │   └─→ Return false
        │   └─→ Bill still created ✓
        │
        ├─→ Admin email not configured
        │   └─→ Log warning
        │   └─→ Return false
        │   └─→ Bill still created ✓
        │
        ├─→ SMTP connection fails
        │   └─→ Log error
        │   └─→ Return false
        │   └─→ Bill still created ✓
        │
        ├─→ Email sending fails
        │   └─→ Log error
        │   └─→ Return false
        │   └─→ Bill still created ✓
        │
        └─→ Success
            └─→ Log success with messageId
            └─→ Return true
            └─→ Bill created ✓
            └─→ Admin email received ✓
```

---

## Summary Table

| Component | File | Function | Status |
|-----------|------|----------|--------|
| Email Config | `src/config/env.js` | Load email settings | ✅ |
| Email Service | `src/utils/emailService.js` | Send emails | ✅ |
| Bill Service | `src/modules/bills/bills.service.js` | Trigger email | ✅ |
| Test Endpoint | `src/modules/bills/bills.controller.js` | Test email config | ✅ |
| Routes | `src/modules/bills/bills.routes.js` | /test-email endpoint | ✅ |
| Dependencies | `package.json` | nodemailer | ✅ |
| Documentation | `EMAIL_SETUP.md` | Setup guide | ✅ |

---

**Architecture Version:** 1.0  
**Last Updated:** March 31, 2026

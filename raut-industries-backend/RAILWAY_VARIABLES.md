# Railway Environment Variables Configuration

## 🚨 CRITICAL FOR PRODUCTION

Copy these exact variable names to your Railway Backend Service:

```
DATABASE_URL          ← Auto-filled by Railway Postgres plugin
JWT_SECRET            ← MUST be set to a random strong string
JWT_EXPIRES_IN        = 7d
NODE_ENV              = production
BCRYPT_ROUNDS         = 10
```

---

## How to Add Variables on Railway

### Method 1: Via Railway Dashboard (Recommended)

1. Go to https://railway.app/dashboard
2. Click on your project "Raut Industries"
3. Click on the Backend service
4. Click the **"Variables"** tab on the left sidebar
5. Click **"Add Variable"**
6. For each variable below:
   - Name: (copy from left column)
   - Value: (copy from right column)
   - Click "Add"

### Method 2: Via Variables View

```
Variables in Railway Backend Service:

┌────────────────────────────┬─────────────────────────────────────────┐
│ Name                       │ Value                                   │
├────────────────────────────┼─────────────────────────────────────────┤
│ DATABASE_URL               │ (AUTO - from Postgres plugin, DO NOT    │
│                            │ EDIT unless you have custom postgres)   │
│                            │                                         │
│ JWT_SECRET                 │ your-super-secret-key-12345             │
│                            │ (Generate a long random string)         │
│                            │                                         │
│ JWT_EXPIRES_IN             │ 7d                                       │
│                            │                                         │
│ NODE_ENV                   │ production                               │
│                            │                                         │
│ BCRYPT_ROUNDS              │ 10                                       │
└────────────────────────────┴─────────────────────────────────────────┘
```

---

## Step-by-Step: First Time Setup

### 1. Deploy PostgreSQL Plugin (if not already done)
```
Railway Dashboard → Your Project → "+ New" → "Database" → "PostgreSQL" → Deploy
```
This auto-generates `DATABASE_URL`

### 2. Get DATABASE_URL Value
```
1. Go to PostgreSQL service (in your project)
2. Click "Variables" tab
3. Look for DATABASE_URL (should be auto-generated)
4. Copy the value
```

### 3. Set Backend Variables
```
1. Go to Backend service
2. Click "Variables" tab
3. Variables should already have DATABASE_URL (inherited from project)
   - If not, add it manually with the value from step 2
4. Add JWT_SECRET:
   - Click "Add Variable"
   - Name: JWT_SECRET
   - Value: (generate a random string, e.g., "super-secret-key-abc123xyz789")
5. Add NODE_ENV:
   - Name: NODE_ENV  
   - Value: production
```

### 4. Deploy Backend
```
1. If connected to GitHub:
   - Push code to main branch
   - Railway auto-deploys
2. If manual:
   - Click "Deploy" button in Railway
   - Select latest code
   - Click "Deploy"
```

### 5. Verify in Logs
```
1. Go to Backend service → Logs
2. Look for these success messages:
   - "✅ PostgreSQL connected successfully"
   - "🔧 Database Configuration: Using DATABASE_URL: Yes"
3. Wait for "Raut Industries server running on port 8080"
```

---

## 🔐 Generating JWT_SECRET

The JWT_SECRET should be a **long, random, strong string**.

### Option 1: Generate in Terminal (Mac/Linux)
```bash
openssl rand -hex 32
# Output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
# Copy this entire string to Railway JWT_SECRET variable
```

### Option 2: Use Online Generator
Visit: https://generate.plus/en/base64
- Select "Hex" format
- Set length to 32
- Click "Generate"

### Option 3: Simple Example (NOT recommended for production)
```
my-super-secret-jwt-key-for-raut-industries-2026
```
Better: Mix uppercase, lowercase, numbers:
```
Raut_Industries_JWT_Secret_2026_aBcDeFgHiJkLmNoPqRsTuVwXyZ_123456
```

---

## ✅ Full Configuration Example

Here's what your Backend Variables tab should look like:

```
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND SERVICE VARIABLES                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ DATABASE_URL                                                    │
│ postgresql://user:pass@host.railway.internal:5432/railway      │
│                                                                 │
│ JWT_SECRET                                                      │
│ a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6         │
│                                                                 │
│ JWT_EXPIRES_IN                                                  │
│ 7d                                                              │
│                                                                 │
│ NODE_ENV                                                        │
│ production                                                      │
│                                                                 │
│ BCRYPT_ROUNDS                                                   │
│ 10                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Verify Setup

### Test 1: Health Endpoint
```bash
curl https://raut-production.up.railway.app/health
```
Expected: `{"status":"ok","project":"Raut Industries"}`

### Test 2: Login Endpoint
```bash
curl -X POST https://raut-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@raut.com","password":"wrong-password"}'
```
Expected: `{"success":false,"message":"Invalid email or password"}`

If you get this → Database is connected ✅

### Test 3: Check Logs
```
Go to Railway Backend Service → Logs
Search for: "PostgreSQL connected"
Should show: "✅ PostgreSQL connected successfully"
```

---

## ❌ Common Mistakes

❌ **Missing DATABASE_URL**
- Fix: Add DATABASE_URL from PostgreSQL plugin

❌ **JWT_SECRET not set**
- Error: "secretOrPrivateKey must be a string"
- Fix: Add JWT_SECRET variable with random string

❌ **Wrong DATABASE_URL format**
- Should start with: `postgresql://`
- Should include: `host`, `port`, `database`, `user`, `password`

❌ **NODE_ENV is not "production"**
- Should be exactly: `production` (lowercase)

---

## ⚡ Quick Copy-Paste for Railway

If you want to quickly set variables, here's the format:

```
DATABASE_URL = [AUTO-FILLED from Postgres plugin]
JWT_SECRET = generate-a-random-strong-string-here
JWT_EXPIRES_IN = 7d
NODE_ENV = production
BCRYPT_ROUNDS = 10
```

Then restart the service and deploy.

---

## 📚 Documentation
- Railway Variables: https://docs.railway.app/reference/variables
- PostgreSQL on Railway: https://docs.railway.app/databases/postgresql

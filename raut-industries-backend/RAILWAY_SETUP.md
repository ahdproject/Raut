# 🚀 Railway Deployment Checklist

## ⚠️ CRITICAL: Environment Variables on Railway

Your backend is getting 500 errors because the database is not configured correctly on Railway.

### Required Variables for Railway Production:

```
DATABASE_URL          = postgresql://user:password@host:port/database
JWT_SECRET            = (generate a strong random secret)
JWT_EXPIRES_IN        = 7d
NODE_ENV              = production
```

### Optional but Recommended:

```
BCRYPT_ROUNDS         = 10
EMAIL_SERVICE         = gmail
EMAIL_USER            = your-email@gmail.com
EMAIL_PASSWORD        = your-app-password
ADMIN_EMAIL           = admin@raut.com
EMAIL_SENDER_NAME     = Raut Industries
COMPANY_STATE_CODE    = 27
```

---

## 🔧 How to Set Variables on Railway

1. **Go to Railway Dashboard:** https://railway.app
2. **Select Project:** Click on "Raut Industries" or your project
3. **Select Service:** Click on Backend/API service
4. **Go to Variables Tab:** Click "Variables" in the sidebar
5. **Add Variables:**
   - Click "Add Variable"
   - Name: `DATABASE_URL`
   - Value: (Leave Railway to auto-fill if using Railway Postgres plugin)
   - Click "Add"
   - Repeat for other variables

---

## 📋 Step-by-Step Setup

### Step 1: Connect PostgreSQL (if not already done)
1. In Railway project, click "+ New"
2. Select "Database"
3. Choose "PostgreSQL"
4. Click "Deploy"
5. Wait for deployment to complete
6. The `DATABASE_URL` will be auto-generated

### Step 2: Verify DATABASE_URL
1. Go to PostgreSQL service Variables
2. Copy the auto-generated `DATABASE_URL`
3. Go to Backend service Variables
4. Check if `DATABASE_URL` is there (it should be inherited or set)

### Step 3: Set Other Required Variables
In Backend service Variables:

```
JWT_SECRET = (generate something like: your-super-secret-jwt-key-12345)
NODE_ENV = production
```

### Step 4: Deploy
- If connected to GitHub: Push code → Railway auto-deploys
- If manual: Deploy button in Railway dashboard

### Step 5: Verify
- Check Logs for: `✅ PostgreSQL connected successfully`
- Test: `curl https://raut-production.up.railway.app/health`

---

## 🐛 Common Issues & Fixes

### ❌ 500 Error: "Database connection failed"
**Problem:** `DATABASE_URL` is not set correctly

**Fix:**
1. Check if Railway Postgres is deployed
2. Go to Postgres service → Variables
3. Copy `DATABASE_URL` value
4. Go to Backend service → Variables
5. Add/Update `DATABASE_URL` with the value

### ❌ 500 Error: "secretOrPrivateKey must be a string"
**Problem:** `JWT_SECRET` is not set

**Fix:**
1. Go to Backend service → Variables
2. Add `JWT_SECRET = your-random-secret-key`

### ❌ 500 Error: "relation 'users' does not exist"
**Problem:** Database tables not created

**Fix:**
1. Connect to Railway PostgreSQL (use pgAdmin or psql)
2. Run your database migration scripts
3. Or run: `npm run seed:admin`

### ❌ 404 Error on login
**Problem:** Routes not properly defined

**Fix:**
1. Check that `src/modules/auth/auth.routes.js` exists
2. Check that it's imported in `src/app.js`
3. Verify route pattern: `/api/auth/login`

---

## ✅ Quick Test After Deployment

```bash
# Test 1: Health check
curl https://raut-production.up.railway.app/health

# Expected response:
# {"status":"ok","project":"Raut Industries"}

# Test 2: Login endpoint (should show proper error if no user)
curl -X POST https://raut-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'

# Expected response (after creating user):
# {"success":true,"data":{"token":"...","user":{...}},"message":"Login successful"}
```

---

## 📚 Railway Documentation Links

- [Railway Variables](https://docs.railway.app/reference/variables)
- [Railway Postgres Plugin](https://docs.railway.app/databases/postgresql)
- [Railway Deployments](https://docs.railway.app/reference/deploying-applications)

---

## ❓ Still Having Issues?

1. **Check Railway Logs:**
   - Service → Logs tab
   - Look for error messages with timestamps

2. **Check Environment Variables:**
   - Service → Variables tab
   - Verify `DATABASE_URL` and `JWT_SECRET` are set

3. **Restart Service:**
   - Service → Settings
   - Click "Restart" button

4. **Redeploy:**
   - Push code to GitHub (if connected)
   - Or manually trigger deploy in Railway dashboard

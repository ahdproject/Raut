# 🔧 Login 500 Error - Quick Verification Checklist

## ✅ Step 1: Verify Frontend → Backend Connection

### Check 1: Is the frontend calling the correct URL?

**Expected:** `https://raut-production.up.railway.app/api/auth/login`

**Verify in:**
- ✅ `.env` file has: `VITE_API_BASE_URL=https://raut-production.up.railway.app`
- ✅ `Apis.js` has: `login: '/auth/login'`
- ✅ `Connector.js` uses: `baseURL: import.meta.env.VITE_API_BASE_URL`
- ✅ `AdminAuthRepo.js` calls: `Connector.post(Apis.login, { email, password })`

**Status: ✅ CORRECT**

---

## ✅ Step 2: Verify Backend Route

### Check 1: Does the backend have the login route?

**Expected:** `POST /api/auth/login`

**Verify in:**
- ✅ `src/app.js` has: `app.use('/api/auth', authRoutes)`
- ✅ `src/modules/auth/auth.routes.js` has: `router.post('/login', authController.login)`

**Result:** Route path = `/api/auth` + `/login` = `/api/auth/login` ✅

**Status: ✅ CORRECT**

---

## ✅ Step 3: Check Railway Environment Variables

Log into Railway Dashboard and verify:

### Required Variables:
```
✅ JWT_SECRET          - Set to your secret key
✅ DB_HOST             - PostgreSQL hostname
✅ DB_PORT             - Usually 5432
✅ DB_NAME             - Your database name
✅ DB_USER             - Database username
✅ DB_PASSWORD         - Database password
✅ NODE_ENV            - Set to "production"
✅ PORT                - Set to 8000
```

### Optional Variables:
```
✅ JWT_EXPIRES_IN      - Set to "7d" (default)
✅ EMAIL_SERVICE       - Set to "gmail"
✅ EMAIL_USER          - Your email
✅ EMAIL_PASSWORD      - Your app password
✅ ADMIN_EMAIL         - Admin email
```

---

## ✅ Step 4: Check Database

Run these commands in your PostgreSQL database:

### Check 1: Does the users table exist?
```sql
SELECT * FROM users;
```
**Expected:** Should show your users (or at least the admin user)

### Check 2: Is there data in the users table?
```sql
SELECT id, name, email, role, is_active FROM users LIMIT 5;
```
**Expected:** Should show at least one user with `is_active = true`

### Check 3: Check user record structure
```sql
\d users;
```
**Expected columns:**
- `id` - integer (primary key)
- `name` - text
- `email` - text
- `password` - text (bcrypt hash)
- `role` - text
- `is_active` - boolean (should be true for test user)
- `last_login_at` - timestamp (optional)

---

## ✅ Step 5: Test with cURL (Local)

If testing locally:

```bash
# Start the backend
cd /Users/devanshu/Desktop/Raut/raut-industries-backend
npm run dev
```

Then in another terminal:

```bash
# Test the endpoint
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@raut.com", "password": "admin123"}'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@raut.com",
      "role": "admin"
    }
  }
}
```

**Expected Response (Wrong Password):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## ✅ Step 6: Check Railway Logs

1. Go to: `https://railway.app/dashboard`
2. Select your Backend Deployment
3. Click **Logs** tab
4. Search for:
   - `LOGIN REQUEST` - Should show request body
   - `LOGIN ATTEMPT` - Should show email
   - `DATABASE` - Should show connection status
   - `ERROR` - Will show any errors

---

## 🚨 If You Still Get 500 Error

### Step 1: Find the actual error in logs

Look for log lines with:
- `[500]`
- `ERROR`
- `error in findUserByEmail`
- `error in auth`
- `DATABASE ERROR`

### Step 2: Identify the error type

**Common 500 Errors:**

| Error | Cause | Fix |
|-------|-------|-----|
| `connect ECONNREFUSED` | Database connection failed | Check DB_HOST, DB_PORT, DB_PASSWORD |
| `relation "users" does not exist` | Table missing | Create users table or restore database |
| `secretOrPrivateKey must be a string` | JWT_SECRET missing | Set JWT_SECRET in Railway |
| `Cannot read property 'password' of undefined` | User not found | Seed database with users |
| `Invalid UTF-8 byte sequence` | Password encoding issue | Reseed database or reset password |

### Step 3: Share the error log

Copy the full error log from Railway and share it for debugging.

---

## 📋 Verification Checklist

- [ ] Frontend `.env` has correct `VITE_API_BASE_URL`
- [ ] Backend route exists (`/api/auth/login`)
- [ ] Railway environment variables are set
- [ ] PostgreSQL database is running
- [ ] Users table exists in database
- [ ] At least one user exists with `is_active = true`
- [ ] JWT_SECRET is configured
- [ ] DB credentials are correct
- [ ] Code changes are deployed to Railway
- [ ] Logs show expected messages (not 500 error)

---

## 🚀 Deploy & Test Workflow

```bash
# 1. Make sure all changes are committed
git status

# 2. Push to main branch
git add -A
git commit -m "Add comprehensive auth logging"
git push origin main

# 3. Wait for Railway to deploy (check status)

# 4. Test from frontend
# Login with: admin@raut.com / admin123

# 5. Check Railway logs for "LOGIN SUCCESS"

# 6. If error, check logs for error details
```

---

## 💡 Pro Tips

1. **Check timestamps** - Make sure logs are from when you just tried to login
2. **Search in logs** - Use Ctrl+F to search for "ERROR" or "500"
3. **Full stack trace** - Look for the full error message, not just the first line
4. **Database connected?** - Check if you see "PostgreSQL connected" in startup logs
5. **Token generated?** - Look for "TOKEN GENERATED" or "AUTH SUCCESS" in logs

---

## 🆘 Still Stuck?

If you've verified all these steps and still getting 500:

1. Share the **exact error message** from Railway logs
2. Share **your `.env` file** (mask passwords if public)
3. Share the **database schema** (run `\d users`)
4. Run this test locally and share output

```bash
npm run dev
# [paste login curl command output here]
```

---

**Last Updated:** May 6, 2026  
**Environment:** Production (Railway)  
**Frontend:** Vite + React  
**Backend:** Express.js + PostgreSQL  


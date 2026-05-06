# 🚨 Debugging 500 Error on /api/auth/login

## What I've Added for You

Enhanced logging throughout the entire login flow to help identify exactly where the 500 error is occurring.

### 1. **Auth Controller** (`src/modules/auth/auth.controller.js`)
- Logs incoming request body
- Logs validation errors
- Logs successful login events
- Catches and logs any exceptions with full details

### 2. **Auth Service** (`src/modules/auth/auth.service.js`)
- Logs user lookup attempts
- Logs password validation steps
- Logs JWT token generation
- Logs all error points (user not found, inactive, invalid password)

### 3. **Auth Repository** (`src/modules/auth/auth.repository.js`)
- Logs database queries
- Catches and logs database errors with error codes
- Logs query results

### 4. **Error Middleware** (`src/middlewares/error.middleware.js`)
- Enhanced to show stack traces and error codes
- Different logging levels for 5xx vs 4xx errors
- Includes request context in error logs

### 5. **Server Startup** (`server.js`)
- Logs environment configuration on startup
- Verifies JWT secret is configured
- Shows database connection info

---

## 🔍 How to Debug

### Step 1: Check Railway Logs
1. Go to Railway Dashboard
2. Navigate to your Backend Deployment
3. Click on **Logs** tab
4. Look for logs starting with:
   - `LOGIN REQUEST`
   - `LOGIN ATTEMPT`
   - `AUTH SERVICE`
   - `AUTH REPO`
   - `LOGIN ERROR`

### Step 2: Try the Login Request Locally
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@raut.com",
    "password": "your-password"
  }'
```

Then check your terminal logs for detailed information.

### Step 3: Common 500 Error Causes

#### 🔴 **Database Connection Failed**
Look for logs like:
```
AUTH REPO - Database error in findUserByEmail:
  message: connect ECONNREFUSED
```
**Fix:** Check `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` environment variables

#### 🔴 **JWT Secret Not Configured**
Look for logs like:
```
Error: secretOrPrivateKey must be a string or buffer
```
**Fix:** Ensure `JWT_SECRET` environment variable is set

#### 🔴 **User Table Missing/Wrong Schema**
Look for logs like:
```
ERROR: relation "users" does not exist
```
**Fix:** Run migrations to create users table

#### 🔴 **Password Column Wrong Type**
If bcrypt compare fails mysteriously, the password hash might be corrupted
**Fix:** Check that password column is TEXT or VARCHAR

#### 🔴 **No Users in Database**
Look for logs like:
```
Auth Service - User lookup result: found: false
```
**Fix:** Seed the database with test users

### Step 4: Check Environment Variables on Railway
```
JWT_SECRET - ✅ Must be set
DB_HOST - ✅ Check if it's your actual PostgreSQL host
DB_PORT - ✅ Usually 5432
DB_NAME - ✅ Your database name
DB_USER - ✅ Your database user
DB_PASSWORD - ✅ Your database password
NODE_ENV - Can be development or production
```

---

## 📋 Login Flow (with logging points)

```
1. Frontend sends POST /api/auth/login
   └─> 📝 LOGIN REQUEST - Body received

2. Validation
   └─> 📝 LOGIN VALIDATION ERROR (if fails)

3. Database lookup
   └─> 📝 AUTH SERVICE - Finding user by email
   └─> 📝 AUTH REPO - Executing query
   └─> 📝 AUTH REPO - Query result: X row(s) found

4. User validation
   └─> 📝 AUTH SERVICE - User lookup result
   └─> 📝 AUTH SERVICE - Account inactive (if inactive)

5. Password validation
   └─> 📝 AUTH SERVICE - Comparing password
   └─> 📝 AUTH SERVICE - Password validation result

6. Token generation
   └─> 📝 AUTH SERVICE - Generating JWT token
   └─> 📝 AUTH SERVICE - Token generated successfully

7. Update last login
   └─> 📝 AUTH REPO - Updating last_login

8. Response
   └─> 📝 LOGIN SUCCESS - User ID: XXX
```

---

## 🧪 Test Cases

### Test 1: Valid Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@raut.com", "password": "admin123"}'
```
**Expected:** 200 with token
**Logs:** Should go through all steps without errors

### Test 2: User Not Found
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "nonexistent@raut.com", "password": "password"}'
```
**Expected:** 401 Invalid Credentials
**Logs:** Should show "User not found"

### Test 3: Invalid Password
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@raut.com", "password": "wrongpassword"}'
```
**Expected:** 401 Invalid Credentials
**Logs:** Should show "Password validation result: false"

### Test 4: Missing Fields
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@raut.com"}'
```
**Expected:** 400 Validation Error
**Logs:** Should show "LOGIN VALIDATION ERROR"

---

## 🚀 Next Steps

1. **Deploy the updated code** to Railway
2. **Try logging in** from your frontend
3. **Check the Railway logs** for the detailed error messages
4. **Share the logs** if you need help interpreting them

The logs should now tell you exactly what's failing! 🎯

---

## 📞 Quick Reference

| Error | Status | Meaning |
|-------|--------|---------|
| LOGIN ATTEMPT - Email: X | INFO | User is attempting to login |
| User not found: X | WARN | Email doesn't exist in database |
| Account inactive: X | WARN | User exists but is_active = false |
| Invalid password | WARN | Password hash doesn't match |
| LOGIN SUCCESS | INFO | Login successful, token generated |
| DATABASE ERROR | ERROR | Connection or query failed |
| 500 response | ERROR | Check logs for full stack trace |


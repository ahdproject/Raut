# ⚡ LOGIN 500 ERROR - QUICK REFERENCE

## 🆘 Problem
```
POST /api/auth/login → Status: 500
Generic "Internal Server Error"
No details about what failed
```

## ✅ Solution Deployed
Enhanced logging throughout authentication flow to show exactly what's failing.

---

## 🚀 3-Minute Fix

### 1. Deploy Updated Code
```bash
git push origin main
# Railway auto-deploys
# Wait ~30 seconds
```

### 2. Check Railway Logs
- Go to Railway Dashboard
- Select Backend
- Click Logs
- Search for: `LOGIN` or `ERROR`

### 3. Try Login
- Use frontend to login
- OR: Use this curl command
```bash
curl -X POST https://raut-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@raut.com", "password": "admin123"}'
```

### 4. Read the Logs
Look for one of these patterns:

```
✅ LOGIN SUCCESS - User ID: 1
→ Login works! Celebrate! 🎉

❌ User not found: admin@raut.com
→ Add user to database

❌ Invalid password
→ Check password is correct

❌ DATABASE ERROR: connect ECONNREFUSED
→ Check DB connection on Railway

❌ secretOrPrivateKey must be a string
→ Set JWT_SECRET environment variable
```

---

## 📋 Expected Logs (Success)

```
LOGIN REQUEST - Body received: {"email":"admin@raut.com",...}
LOGIN ATTEMPT - Email: admin@raut.com
AUTH SERVICE - Finding user by email
AUTH REPO - Query result: 1 row(s)
AUTH SERVICE - Password validation result: true
AUTH SERVICE - Generating JWT token
LOGIN SUCCESS - User ID: 1
```

---

## 📋 Expected Logs (Failure Examples)

### User Not Found
```
User not found: admin@raut.com
→ Solution: Seed database with test users
```

### Invalid Password
```
Password validation result: false
→ Solution: Use correct password
```

### Database Error
```
DATABASE ERROR - Database error in findUserByEmail
message: connect ECONNREFUSED
→ Solution: Check DB_HOST, DB_PORT, DB_PASSWORD
```

### JWT Secret Missing
```
secretOrPrivateKey must be a string
→ Solution: Set JWT_SECRET in Railway environment
```

---

## 🔍 Error Location Clues

| Log Contains | Problem Area |
|-------------|--------------|
| DATABASE ERROR | PostgreSQL connection |
| password' of undefined | User not in database |
| secretOrPrivateKey | JWT_SECRET not set |
| Query result: 0 | Email doesn't exist |
| Query result: 1 | Email found |
| Password validation: false | Wrong password |
| Account inactive | User disabled in database |

---

## ✅ Verification Checklist

- [ ] Code deployed to Railway
- [ ] Railway shows "Running" status
- [ ] Tried login attempt
- [ ] Checked Railway logs
- [ ] Found error message
- [ ] Fixed the issue identified in logs

---

## 📋 Files Changed

1. `src/modules/auth/auth.controller.js` - Added logging
2. `src/modules/auth/auth.service.js` - Added logging
3. `src/modules/auth/auth.repository.js` - Added logging
4. `src/middlewares/error.middleware.js` - Enhanced error handling
5. `server.js` - Added startup verification

---

## 💻 Terminal Commands

### Test Locally
```bash
npm run dev
# Runs on http://localhost:8000
```

### Test Remote
```bash
curl -X POST https://raut-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@raut.com","password":"admin123"}'
```

### Deploy
```bash
git add -A
git commit -m "Add auth logging"
git push origin main
```

---

## 🎯 Common Fixes (Copy-Paste)

### Issue: Database Connection Failed
**Log:** `connect ECONNREFUSED`
**Fix:** On Railway, check:
```
DB_HOST = your-postgres-host
DB_PORT = 5432
DB_USER = postgres
DB_PASSWORD = your-password
```

### Issue: JWT Secret Missing
**Log:** `secretOrPrivateKey must be a string`
**Fix:** On Railway, add:
```
JWT_SECRET = some-random-string-at-least-32-chars
```

### Issue: No Users in Database
**Log:** `Query result: 0 row(s)`
**Fix:** In PostgreSQL, run:
```sql
SELECT * FROM users;
-- If empty, need to seed data
```

### Issue: Password Wrong
**Log:** `Password validation result: false`
**Fix:** Use correct password for test user
```
Email: admin@raut.com
Password: admin123  (or your set password)
```

---

## 📞 If Still Stuck

1. **Copy full error log** from Railway
2. **Check all status codes** (should not be 500):
   - 200 = Success
   - 400 = Bad request
   - 401 = Wrong credentials
   - 403 = Account disabled
   - 500 = Server error
3. **Share the logs** - the error message will tell the story

---

## 🎓 Learning Path

If you want to understand the flow:

1. Read: `src/modules/auth/auth.controller.js`
2. Read: `src/modules/auth/auth.service.js`
3. Read: `src/modules/auth/auth.repository.js`
4. Read: `src/middlewares/error.middleware.js`

Each file has detailed comments and logs.

---

## 📊 Status

| Item | Status |
|------|--------|
| Frontend URL | ✅ Correct |
| Backend Route | ✅ Correct |
| Database Config | ⏳ Check logs |
| Error Logging | ✅ Enhanced |
| Error Handling | ✅ Improved |

---

## 🚀 Next Steps

1. Push code to main branch
2. Wait for Railway deployment
3. Try login
4. Check logs
5. Fix based on error message

**That's it!** The logs will guide you. 🎯

---

**Quick Ref:** For debugging, logs are your best friend! 🔍


#!/bin/bash

# Email Configuration Test Script
# Tests the email configuration step by step

echo "🧪 Raut Industries Email Configuration Test"
echo "=========================================="
echo ""

# Check .env file
echo "1️⃣  Checking .env file..."
if [ -f ".env" ]; then
    echo "✅ .env file found"
    echo "   EMAIL_USER: $(grep EMAIL_USER .env | cut -d '=' -f2)"
    echo "   ADMIN_EMAIL: $(grep ADMIN_EMAIL .env | cut -d '=' -f2)"
    echo "   EMAIL_SERVICE: $(grep EMAIL_SERVICE .env | cut -d '=' -f2)"
else
    echo "❌ .env file NOT found"
    exit 1
fi
echo ""

# Check if backend is running
echo "2️⃣  Checking if backend is running..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is running on http://localhost:8000"
else
    echo "❌ Backend is NOT running. Start with: npm run dev"
    exit 1
fi
echo ""

# Check nodemailer installation
echo "3️⃣  Checking nodemailer installation..."
if npm list nodemailer 2>/dev/null | grep nodemailer > /dev/null; then
    echo "✅ nodemailer is installed"
    npm list nodemailer 2>/dev/null | head -3
else
    echo "❌ nodemailer is NOT installed. Run: npm install"
    exit 1
fi
echo ""

# Check email service file
echo "4️⃣  Checking email service file..."
if [ -f "src/utils/emailService.js" ]; then
    echo "✅ emailService.js found"
    echo "   Lines: $(wc -l < src/utils/emailService.js)"
else
    echo "❌ emailService.js NOT found"
    exit 1
fi
echo ""

# Check bills.service integration
echo "5️⃣  Checking bills.service integration..."
if grep -q "emailService" src/modules/bills/bills.service.js; then
    echo "✅ bills.service.js has email integration"
else
    echo "❌ bills.service.js does NOT have email integration"
    exit 1
fi
echo ""

echo "✅ All configuration checks passed!"
echo ""
echo "📧 Next steps:"
echo "   1. Test email endpoint:"
echo "      curl -X POST http://localhost:8000/api/bills/test-email \\"
echo "        -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "        -H \"Content-Type: application/json\" \\"
echo "        -d '{\"email\":\"test@gmail.com\"}'"
echo ""
echo "   2. Or create a bill and check if email is sent"
echo ""

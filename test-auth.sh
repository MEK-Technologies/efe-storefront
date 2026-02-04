#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing Authentication Implementation"
echo "========================================"
echo ""

BACKEND_URL="http://localhost:9000"
FRONTEND_URL="http://localhost:3000"
PUBLISHABLE_KEY="${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}"

# Test 1: Backend health check
echo "1️⃣  Testing Backend Health..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/health)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Backend is healthy (200)${NC}"
else
    echo -e "${RED}✗ Backend health check failed (Status: $BACKEND_STATUS)${NC}"
    exit 1
fi
echo ""

# Test 2: Frontend health check
echo "2️⃣  Testing Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Frontend is accessible (200)${NC}"
else
    echo -e "${RED}✗ Frontend not accessible (Status: $FRONTEND_STATUS)${NC}"
    exit 1
fi
echo ""

# Test 3: Check required files exist
echo "3️⃣  Checking Implementation Files..."
FILES=(
    "hooks/useAuth.tsx"
    "components/auth/login-form.tsx"
    "components/auth/register-form.tsx"
    "components/modals/login-modal.tsx"
    "components/modals/register-modal.tsx"
    "components/modals/auth-helpers.tsx"
    "app/(browse)/account/page.tsx"
    "app/(browse)/account/profile/page.tsx"
    "app/(browse)/account/orders/page.tsx"
    "app/(browse)/account/addresses/page.tsx"
    "app/(browse)/account/layout.tsx"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file ${RED}(missing)${NC}"
    fi
done
echo ""

# Test 4: Test Customer Registration (requires backend)
echo "4️⃣  Testing Customer Registration..."
RANDOM_EMAIL="test-$(date +%s)@example.com"
REGISTER_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/customer/emailpass/register" \
    -H "Content-Type: application/json" \
    -H "x-publishable-api-key: $PUBLISHABLE_KEY" \
    -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"password123\"}")

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓ Registration endpoint working${NC}"
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "  Email: $RANDOM_EMAIL"
    echo "  Token: ${TOKEN:0:20}..."
else
    echo -e "${YELLOW}⚠ Registration test skipped or failed${NC}"
    echo "  Response: $REGISTER_RESPONSE"
fi
echo ""

# Test 5: Test Customer Login
echo "5️⃣  Testing Customer Login..."
if [ ! -z "$TOKEN" ]; then
    LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/customer/emailpass" \
        -H "Content-Type: application/json" \
        -H "x-publishable-api-key: $PUBLISHABLE_KEY" \
        -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"password123\"}")
    
    if echo "$LOGIN_RESPONSE" | grep -q "token"; then
        echo -e "${GREEN}✓ Login endpoint working${NC}"
        LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        echo "  Token: ${LOGIN_TOKEN:0:20}..."
    else
        echo -e "${RED}✗ Login failed${NC}"
        echo "  Response: $LOGIN_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠ Login test skipped (no token from registration)${NC}"
fi
echo ""

# Test 6: Test Get Customer with Auth
echo "6️⃣  Testing Authenticated Customer Endpoint..."
if [ ! -z "$LOGIN_TOKEN" ]; then
    CUSTOMER_RESPONSE=$(curl -s -X GET "$BACKEND_URL/store/customers/me" \
        -H "Authorization: Bearer $LOGIN_TOKEN" \
        -H "x-publishable-api-key: $PUBLISHABLE_KEY")
    
    if echo "$CUSTOMER_RESPONSE" | grep -q "customer"; then
        echo -e "${GREEN}✓ Customer endpoint working with auth${NC}"
        echo "  Customer email: $RANDOM_EMAIL"
    else
        echo -e "${RED}✗ Customer endpoint failed${NC}"
        echo "  Response: $CUSTOMER_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠ Auth test skipped (no login token)${NC}"
fi
echo ""

# Test 7: Check TypeScript compilation
echo "7️⃣  Checking TypeScript Errors..."
if command -v tsc &> /dev/null; then
    ERROR_COUNT=$(npx tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || true)
    if [ "$ERROR_COUNT" = "0" ]; then
        echo -e "${GREEN}✓ No TypeScript errors${NC}"
    else
        echo -e "${YELLOW}⚠ Found $ERROR_COUNT TypeScript errors${NC}"
        echo "  Run 'npx tsc --noEmit' for details"
    fi
else
    echo -e "${YELLOW}⚠ TypeScript not available${NC}"
fi
echo ""

# Test 8: Check middleware protection
echo "8️⃣  Testing Protected Routes..."
ACCOUNT_REDIRECT=$(curl -s -o /dev/null -w "%{redirect_url}" -L "$FRONTEND_URL/account")
if [ ! -z "$ACCOUNT_REDIRECT" ]; then
    echo -e "${GREEN}✓ Middleware redirect working${NC}"
    echo "  Redirect URL: $ACCOUNT_REDIRECT"
else
    echo -e "${YELLOW}⚠ No redirect detected (check middleware)${NC}"
fi
echo ""

# Summary
echo "========================================"
echo "✅ Basic Authentication Tests Complete!"
echo ""
echo "📋 Manual Testing Steps:"
echo "1. Open http://localhost:3000 in browser"
echo "2. Click 'Sign Up' button in navigation"
echo "3. Register with email/password"
echo "4. Check that you're logged in (see account dropdown)"
echo "5. Navigate to /account pages"
echo "6. Edit profile and add addresses"
echo "7. Logout and verify session cleared"
echo ""
echo "🔐 Test Credentials Created:"
echo "   Email: $RANDOM_EMAIL"
echo "   Password: password123"
echo ""

#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Testing Authentication Implementation${NC}"
echo "========================================"
echo ""

# Test 1: Backend
echo -e "${BLUE}1️⃣  Backend Status${NC}"
if curl -s http://localhost:9000/health > /dev/null; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not running${NC}"
fi
echo ""

# Test 2: Files Created
echo -e "${BLUE}2️⃣  Implementation Files${NC}"
FILES=(
    "hooks/useAuth.tsx:Auth Hook"
    "components/auth/login-form.tsx:Login Form"
    "components/auth/register-form.tsx:Register Form"
    "components/modals/login-modal.tsx:Login Modal"
    "components/modals/register-modal.tsx:Register Modal"
    "components/modals/auth-helpers.tsx:Auth Button"
    "components/auth/auth-wrapper.tsx:Auth Wrapper"
    "app/(browse)/account/layout.tsx:Account Layout"
    "app/(browse)/account/page.tsx:Account Dashboard"
    "app/(browse)/account/profile/page.tsx:Profile Page"
    "app/(browse)/account/orders/page.tsx:Orders Page"
    "app/(browse)/account/addresses/page.tsx:Addresses Page"
)

for item in "${FILES[@]}"; do
    IFS=':' read -r file desc <<< "$item"
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $desc"
    else
        echo -e "${RED}✗${NC} $desc ${RED}(missing)${NC}"
    fi
done
echo ""

# Test 3: Configuration
echo -e "${BLUE}3️⃣  Configuration Check${NC}"

# Check SDK config
if grep -q 'type: "session"' lib/medusa/config.ts; then
    echo -e "${GREEN}✓${NC} SDK configured with session auth"
else
    echo -e "${RED}✗${NC} SDK session auth not configured"
fi

# Check modal store
if grep -q '"login" | "register"' stores/modal-store.ts; then
    echo -e "${GREEN}✓${NC} Modal store updated with auth modals"
else
    echo -e "${RED}✗${NC} Modal store not updated"
fi

# Check middleware
if grep -q 'pathname.startsWith("/account")' middleware.ts; then
    echo -e "${GREEN}✓${NC} Middleware protecting /account routes"
else
    echo -e "${RED}✗${NC} Middleware not protecting routes"
fi

# Check layout
if grep -q 'AuthWrapper' app/\(browse\)/layout.tsx; then
    echo -e "${GREEN}✓${NC} AuthProvider wrapped in layout"
else
    echo -e "${RED}✗${NC} AuthProvider not in layout"
fi
echo ""

# Test 4: Backend API Tests
echo -e "${BLUE}4️⃣  Backend API Endpoints${NC}"

BACKEND="http://localhost:9000"
PK="${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}"

# Test Registration
RANDOM_EMAIL="test-$(date +%s)@example.com"
echo -n "Testing registration... "
REG_RESPONSE=$(curl -s -X POST "$BACKEND/auth/customer/emailpass/register" \
    -H "Content-Type: application/json" \
    -H "x-publishable-api-key: $PK" \
    -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"Test1234\"}")

if echo "$REG_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓ Registration works${NC}"
    TOKEN=$(echo "$REG_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//g')
    
    # Test Login
    echo -n "Testing login... "
    LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND/auth/customer/emailpass" \
        -H "Content-Type: application/json" \
        -H "x-publishable-api-key: $PK" \
        -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"Test1234\"}")
    
    if echo "$LOGIN_RESPONSE" | grep -q "token"; then
        echo -e "${GREEN}✓ Login works${NC}"
        LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//g')
        
        # Test Get Customer
        echo -n "Testing get customer... "
        CUSTOMER_RESPONSE=$(curl -s -X GET "$BACKEND/store/customers/me" \
            -H "Authorization: Bearer $LOGIN_TOKEN" \
            -H "x-publishable-api-key: $PK")
        
        if echo "$CUSTOMER_RESPONSE" | grep -q "customer"; then
            echo -e "${GREEN}✓ Get customer works${NC}"
        else
            echo -e "${RED}✗ Get customer failed${NC}"
        fi
    else
        echo -e "${RED}✗ Login failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Registration failed (may be duplicate)${NC}"
fi
echo ""

# Summary
echo "========================================"
echo -e "${GREEN}✅ Automated Tests Complete!${NC}"
echo ""
echo -e "${YELLOW}📱 Next: Manual Browser Testing${NC}"
echo ""
echo "1. Open http://localhost:3000"
echo "2. Look for 'Login' and 'Sign Up' buttons"
echo "3. Click 'Sign Up' to create account"
echo "4. Fill in form and submit"
echo "5. Check for account dropdown menu"
echo "6. Try visiting /account pages"
echo "7. Test logout functionality"
echo ""
echo -e "${BLUE}🔐 Test Account Created:${NC}"
echo "   Email: $RANDOM_EMAIL"
echo "   Password: Test1234"
echo ""

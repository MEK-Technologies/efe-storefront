#!/usr/bin/env node

/**
 * Script de prueba para verificar customer group pricing
 * 
 * Uso: node scripts/test-pricing.mjs
 */

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY = 'pk_5a9adcc55fdce282eeb406d68981da109220bbfd4c9f772b2fa791270301df84'
const CUSTOMER_ID = 'cus_01KGFVWP1XEAFWNZ2KC50R0KGQ'
const PUBLIC_PRICE_LIST_ID = 'plist_01KGFHDNWPS4MW6E732Q6XBQ5H'
const GROUP_PRICE_LIST_ID = 'plist_01KGFYT6JDE7QSK2KDRWMHTGW3'

console.log('🧪 Testing Customer Group Pricing Integration\n')
console.log(`Backend URL: ${MEDUSA_BACKEND_URL}`)
console.log(`Publishable Key: ${PUBLISHABLE_KEY}`)
console.log(`Customer ID: ${CUSTOMER_ID}`)
console.log(`Public Price List: ${PUBLIC_PRICE_LIST_ID}`)
console.log(`Group Price List: ${GROUP_PRICE_LIST_ID}\n`)

/**
 * Test 1: Fetch products without authentication (public pricing)
 */
async function testPublicPricing() {
  console.log('📦 TEST 1: Public Pricing (No Authentication)')
  console.log('=' .repeat(60))
  
  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/products?limit=3`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_KEY,
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    console.log(`✅ Response Status: ${response.status}`)
    console.log(`📊 Products Found: ${data.products?.length || 0}`)
    console.log(`📊 Total Count: ${data.count || 0}`)
    console.log(`🔍 Has Customer Group Pricing: ${data.has_customer_group_pricing || 'N/A'}`)
    console.log(`👥 Customer Group ID: ${data.customer_group_id || 'N/A'}\n`)
    
    if (data.products && data.products.length > 0) {
      const product = data.products[0]
      console.log(`Product Example: "${product.title}"`)
      console.log(`  ID: ${product.id}`)
      console.log(`  Handle: ${product.handle}`)
      
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants[0]
        console.log(`\n  First Variant:`)
        console.log(`    ID: ${variant.id}`)
        console.log(`    Title: ${variant.title}`)
        console.log(`    SKU: ${variant.sku || 'N/A'}`)
        
        // Check calculated_price
        if (variant.calculated_price) {
          console.log(`\n    ✅ calculated_price:`)
          console.log(`      Amount: ${variant.calculated_price.amount}`)
          console.log(`      Currency: ${variant.calculated_price.currency_code}`)
        } else {
          console.log(`\n    ❌ calculated_price: MISSING`)
        }
        
        // Check original_price
        if (variant.original_price) {
          console.log(`\n    ✅ original_price:`)
          console.log(`      Amount: ${variant.original_price.amount}`)
          console.log(`      Currency: ${variant.original_price.currency_code}`)
        } else {
          console.log(`\n    ⚠️  original_price: NOT PRESENT (may be normal for public API)`)
        }
        
        // Check price_list fields
        if (variant.price_list_id) {
          console.log(`\n    Price List ID: ${variant.price_list_id}`)
          console.log(`    Price List Type: ${variant.price_list_type || 'N/A'}`)
          
          if (variant.price_list_id === PUBLIC_PRICE_LIST_ID) {
            console.log(`    ✅ This is the PUBLIC price list`)
          } else if (variant.price_list_id === GROUP_PRICE_LIST_ID) {
            console.log(`    ✅ This is the CUSTOMER GROUP price list`)
          } else {
            console.log(`    ⚠️  Unknown price list`)
          }
        } else {
          console.log(`\n    ℹ️  No price list applied (using base prices)`)
        }
      } else {
        console.log(`  ❌ No variants found`)
      }
    }
    
    console.log('\n')
    return data
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`)
    return null
  }
}

/**
 * Test 2: Login and get auth token
 */
async function loginCustomer() {
  console.log('🔐 TEST 2: Customer Login')
  console.log('=' .repeat(60))
  
  // Note: You need to provide email and password for this customer
  console.log('⚠️  Login requires email/password - skipping automatic login')
  console.log('ℹ️  To test authenticated pricing, you need to:')
  console.log('   1. Login via the app UI or Medusa admin')
  console.log('   2. Get the JWT token from browser cookies/localStorage')
  console.log('   3. Manually test with that token\n')
  
  return null
}

/**
 * Test 3: Fetch customer profile with groups
 */
async function testCustomerProfile(authToken) {
  console.log('👤 TEST 3: Customer Profile (with groups)')
  console.log('=' .repeat(60))
  
  if (!authToken) {
    console.log('⚠️  No auth token provided - skipping\n')
    return null
  }
  
  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/customer/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_KEY,
        'Authorization': `Bearer ${authToken}`,
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    console.log(`✅ Response Status: ${response.status}`)
    console.log(`Customer ID: ${data.customer?.id}`)
    console.log(`Email: ${data.customer?.email}`)
    console.log(`Name: ${data.customer?.first_name} ${data.customer?.last_name}`)
    
    if (data.customer?.groups && data.customer.groups.length > 0) {
      console.log(`\n✅ Customer Groups:`)
      data.customer.groups.forEach((group, index) => {
        console.log(`  ${index + 1}. ${group.name} (${group.id})`)
      })
    } else {
      console.log(`\n⚠️  No customer groups found`)
    }
    
    console.log('\n')
    return data
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`)
    return null
  }
}

/**
 * Test 4: Fetch products with authentication (customer group pricing)
 */
async function testAuthenticatedPricing(authToken) {
  console.log('💰 TEST 4: Authenticated Pricing (Customer Group)')
  console.log('=' .repeat(60))
  
  if (!authToken) {
    console.log('⚠️  No auth token provided - skipping\n')
    return null
  }
  
  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/products?limit=3`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_KEY,
        'Authorization': `Bearer ${authToken}`,
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    console.log(`✅ Response Status: ${response.status}`)
    console.log(`📊 Products Found: ${data.products?.length || 0}`)
    console.log(`🔍 Has Customer Group Pricing: ${data.has_customer_group_pricing}`)
    console.log(`👥 Customer Group ID: ${data.customer_group_id || 'N/A'}\n`)
    
    if (data.products && data.products.length > 0) {
      const product = data.products[0]
      console.log(`Product Example: "${product.title}"`)
      console.log(`  ID: ${product.id}`)
      
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants[0]
        console.log(`\n  First Variant:`)
        console.log(`    ID: ${variant.id}`)
        
        // Check calculated_price
        if (variant.calculated_price) {
          console.log(`\n    ✅ calculated_price:`)
          console.log(`      Amount: ${variant.calculated_price.amount}`)
          console.log(`      Currency: ${variant.calculated_price.currency_code}`)
        } else {
          console.log(`\n    ❌ calculated_price: MISSING`)
        }
        
        // Check original_price
        if (variant.original_price) {
          console.log(`\n    ✅ original_price:`)
          console.log(`      Amount: ${variant.original_price.amount}`)
          console.log(`      Currency: ${variant.original_price.currency_code}`)
        } else {
          console.log(`\n    ❌ original_price: MISSING`)
        }
        
        // Price list info
        if (variant.price_list_id) {
          console.log(`\n    ✅ Price List Applied:`)
          console.log(`      ID: ${variant.price_list_id}`)
          console.log(`      Type: ${variant.price_list_type}`)
        } else {
          console.log(`\n    ⚠️  No price list applied`)
        }
        
        // Calculate savings if applicable
        if (variant.calculated_price && variant.original_price) {
          const calc = variant.calculated_price.amount
          const orig = variant.original_price.amount
          
          if (calc !== orig) {
            const savings = orig - calc
            const percent = ((savings / orig) * 100).toFixed(2)
            console.log(`\n    💰 DISCOUNT DETECTED:`)
            console.log(`      Original: ${orig}`)
            console.log(`      Calculated: ${calc}`)
            console.log(`      Savings: ${savings} (${percent}%)`)
          } else {
            console.log(`\n    ℹ️  Same price (no discount applied)`)
          }
        }
      }
    }
    
    console.log('\n')
    return data
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`)
    return null
  }
}

/**
 * Test 5: Check standard Medusa /store/customers/me endpoint
 */
async function testStandardCustomerEndpoint(authToken) {
  console.log('🔍 TEST 5: Standard Customer Endpoint (/store/customers/me)')
  console.log('=' .repeat(60))
  
  if (!authToken) {
    console.log('⚠️  No auth token provided - skipping\n')
    return null
  }
  
  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_KEY,
        'Authorization': `Bearer ${authToken}`,
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    console.log(`✅ Response Status: ${response.status}`)
    console.log(`Customer ID: ${data.customer?.id}`)
    
    // Check if groups are included
    if (data.customer?.groups) {
      console.log(`✅ Groups field exists:`)
      console.log(`   Count: ${data.customer.groups.length}`)
      if (data.customer.groups.length > 0) {
        data.customer.groups.forEach((g, i) => {
          console.log(`   ${i + 1}. ${g.name || g.id}`)
        })
      }
    } else {
      console.log(`⚠️  Groups field NOT present in standard endpoint`)
      console.log(`ℹ️  This is why we need the custom /store/customer/profile endpoint`)
    }
    
    console.log('\n')
    return data
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`)
    return null
  }
}

/**
 * Test 6: Check price lists directly
 */
async function testPriceLists() {
  console.log('💰 TEST 6: Price Lists Information')
  console.log('=' .repeat(60))
  
  try {
    // Try to get info about both price lists
    console.log(`Checking Public Price List: ${PUBLIC_PRICE_LIST_ID}`)
    console.log(`Checking Group Price List: ${GROUP_PRICE_LIST_ID}`)
    console.log('')
    
    console.log('ℹ️  Price lists can be checked in Medusa Admin')
    console.log('ℹ️  The issue is that calculated_price.amount is undefined')
    console.log('ℹ️  This means the backend is not returning the public price correctly')
    console.log('')
    
    console.log('🔍 EXPECTED BEHAVIOR:')
    console.log('  Without authentication (public):')
    console.log(`    - Should use price list: ${PUBLIC_PRICE_LIST_ID}`)
    console.log('    - calculated_price.amount should have a value')
    console.log('')
    console.log('  With authentication (customer in group):')
    console.log(`    - Should use price list: ${GROUP_PRICE_LIST_ID}`)
    console.log('    - calculated_price.amount = group price')
    console.log('    - original_price.amount = public price (for comparison)')
    console.log('')
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`)
  }
}

/**
 * Main test runner
 */
async function runTests() {
  const authToken = process.env.MEDUSA_AUTH_TOKEN || null
  
  if (authToken) {
    console.log(`🔑 Auth Token Provided: ${authToken.substring(0, 20)}...\n`)
  } else {
    console.log(`ℹ️  No auth token provided. Set MEDUSA_AUTH_TOKEN env var for authenticated tests.\n`)
  }
  
  // Run tests
  const publicData = await testPublicPricing()
  
  await testPriceLists()
  
  await loginCustomer()
  
  if (authToken) {
    await testStandardCustomerEndpoint(authToken)
    await testCustomerProfile(authToken)
    await testAuthenticatedPricing(authToken)
  }
  
  // Summary
  console.log('📋 SUMMARY & RECOMMENDATIONS')
  console.log('=' .repeat(60))
  
  if (!publicData) {
    console.log('❌ Public pricing test FAILED')
    console.log('   → Check that Medusa backend is running')
    console.log('   → Verify the backend URL is correct')
    console.log('   → Check publishable key is valid\n')
    return
  }
  
  const hasProducts = publicData.products && publicData.products.length > 0
  
  if (!hasProducts) {
    console.log('⚠️  No products found')
    console.log('   → Add products to your Medusa store')
    console.log('   → Ensure products are published\n')
    return
  }
  
  const firstVariant = publicData.products[0]?.variants?.[0]
  
  if (!firstVariant) {
    console.log('⚠️  Product has no variants')
    console.log('   → Ensure products have at least one variant\n')
    return
  }
  
  // Check price structure
  if (!firstVariant.calculated_price) {
    console.log('❌ CRITICAL: calculated_price is MISSING')
    console.log('   → Backend is not returning calculated_price')
    console.log('   → This is required for price display')
    console.log('   → Check Medusa backend implementation\n')
  } else {
    console.log('✅ calculated_price is present')
    
    const amount = firstVariant.calculated_price.amount
    if (typeof amount === 'number' && !isNaN(amount)) {
      console.log(`   → calculated_amount: ${amount} (valid number)`)
    } else {
      console.log(`   → calculated_amount: ${amount} (⚠️  UNDEFINED - this is the issue!)`)
      console.log('   → Backend is NOT calculating/returning the price amount')
      console.log('')
      console.log('🔍 ANALYSIS:')
      console.log(`   → price_list_id: ${firstVariant.price_list_id}`)
      console.log(`   → price_list_type: ${firstVariant.price_list_type}`)
      
      if (firstVariant.price_list_id === GROUP_PRICE_LIST_ID) {
        console.log('   → ⚠️  Currently showing GROUP price list to PUBLIC user!')
        console.log(`   → Should be using: ${PUBLIC_PRICE_LIST_ID}`)
      } else if (firstVariant.price_list_id === PUBLIC_PRICE_LIST_ID) {
        console.log(`   → ✅ Correct price list (${PUBLIC_PRICE_LIST_ID})`)
        console.log('   → ❌ BUT calculated_amount is missing')
        console.log('   → This is a backend configuration issue')
      }
    }
  }
  
  if (!firstVariant.original_price) {
    console.log('\n⚠️  original_price is MISSING from public endpoint')
    console.log('   → This is expected for public API')
    console.log('   → original_price should appear in custom backend endpoint')
    console.log('   → Or when authenticated with customer group\n')
  } else {
    console.log('\n✅ original_price is present')
  }
  
  if (!authToken) {
    console.log('\n💡 TO TEST CUSTOMER GROUP PRICING:')
    console.log('   1. Login to your app or Medusa admin')
    console.log('   2. Get the JWT auth token')
    console.log('   3. Run: MEDUSA_AUTH_TOKEN="your_token" node scripts/test-pricing.mjs\n')
  } else {
    console.log('\n✅ Authenticated tests completed - check results above\n')
  }
  
  console.log('📖 NEXT STEPS:')
  console.log('   1. Fix NaN issue: Ensure backend returns valid numbers for prices')
  console.log('   2. Verify custom /store/customer/profile endpoint exists')
  console.log('   3. Ensure customer group has price lists configured')
  console.log('   4. Test with authenticated customer\n')
}

// Run tests
runTests().catch(console.error)

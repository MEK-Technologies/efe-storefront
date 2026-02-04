# Customer Group Pricing - Quick Reference

## 🎯 Quick Start

### 1. Get Customer Groups in Component
```typescript
import { useAuth } from "hooks/useAuth"

function MyComponent() {
  const { customerGroups, hasCustomerGroups } = useAuth()
  
  if (hasCustomerGroups) {
    console.log("Customer groups:", customerGroups)
    // [{ id: "cusgroup_xxx", name: "VIP" }]
  }
}
```

### 2. Display Product with Group Pricing
```typescript
import { ProductCard } from "components/product-card"
import { useAuth } from "hooks/useAuth"

function ProductGrid({ products }) {
  const { hasCustomerGroups } = useAuth()
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          hasCustomerGroupPricing={hasCustomerGroups}
        />
      ))}
    </div>
  )
}
```

### 3. Show Price Directly
```typescript
import { ProductPrice } from "components/product/product-price"
import { useAuth } from "hooks/useAuth"

function PriceDisplay({ variant }) {
  const { hasCustomerGroups } = useAuth()
  
  return (
    <ProductPrice
      calculatedPrice={variant.calculated_price}
      originalPrice={variant.original_price}
      hasCustomerGroupPricing={hasCustomerGroups}
      variant="detailed"
    />
  )
}
```

## 📊 Available Components

### ProductPrice Component

**Variants:**
- `"compact"` - Small cards (1-2 lines)
- `"default"` - Medium display with badges
- `"detailed"` - Large display with comparison

**Props:**
```typescript
{
  calculatedPrice: { amount: number, currency_code: string } | null
  originalPrice: { amount: number, currency_code: string } | null
  hasCustomerGroupPricing?: boolean  // From useAuth
  priceListType?: "sale" | "override"
  variant?: "compact" | "default" | "detailed"
  showBadge?: boolean  // Default: true
  className?: string
}
```

### Updated Product Cards

All accept `hasCustomerGroupPricing` prop:
- `ProductCard` - Main product card
- `CompactProductCard` - Compact variant
- `UniformProductCard` - Uniform layout

## 🔧 Utility Functions

```typescript
import { 
  hasGroupPricing, 
  calculateSavings, 
  getPriceComparison,
  formatPriceFromCentavos 
} from "utils/medusa-product-helpers"

// Check if variant has group pricing
const hasDiscount = hasGroupPricing(variant)

// Calculate savings
const { savings, savingsPercent } = calculateSavings(127500, 150000)
// Returns: { savings: 22500, savingsPercent: "15" }

// Get full comparison
const comparison = getPriceComparison(variant)
// Returns: { calculated, original, hasDifference, priceListType, savings, savingsPercent }

// Format price
const formatted = formatPriceFromCentavos(150000, "DOP")
// Returns: "RD$ 1,500.00"
```

## 🎨 UI Patterns

### Customer Group Banner
```typescript
import { useAuth } from "hooks/useAuth"

function CustomerGroupBanner() {
  const { customerGroups, hasCustomerGroups } = useAuth()
  
  if (!hasCustomerGroups) return null
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded p-4">
      <p className="text-blue-800">
        Welcome! You're viewing <strong>{customerGroups[0].name}</strong> pricing
      </p>
    </div>
  )
}
```

### Login Prompt for Better Prices
```typescript
import { useAuth } from "hooks/useAuth"

function PriceLoginPrompt() {
  const { isAuthenticated } = useAuth()
  
  if (isAuthenticated) return null
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
      <p>Login to see exclusive pricing for your customer group</p>
      <button className="mt-2 btn-primary">Login Now</button>
    </div>
  )
}
```

### Conditional Pricing Display
```typescript
function ProductInfo({ product }) {
  const { hasCustomerGroups, isAuthenticated } = useAuth()
  const variant = product.variants[0]
  
  return (
    <div>
      {isAuthenticated ? (
        <ProductPrice
          calculatedPrice={variant.calculated_price}
          originalPrice={variant.original_price}
          hasCustomerGroupPricing={hasCustomerGroups}
          variant="detailed"
        />
      ) : (
        <div>
          <p className="text-2xl font-bold">
            {formatPriceFromCentavos(variant.calculated_price.amount)}
          </p>
          <p className="text-sm text-muted-foreground">
            Login to see your special pricing
          </p>
        </div>
      )}
    </div>
  )
}
```

## 📦 Type Definitions

```typescript
// Import types
import type { 
  VariantWithPricing,
  CustomerWithGroups,
  CustomerGroup,
  PriceComparison,
  ProductsWithGroupPricing 
} from "types/medusa-extensions"

// Use in your components
const variant: VariantWithPricing = product.variants[0]
const customer: CustomerWithGroups = useAuth().customer
const groups: CustomerGroup[] = useAuth().customerGroups
```

## 🔍 Debugging Tips

### Check if customer has groups
```typescript
const { customer, customerGroups } = useAuth()
console.log("Customer:", customer)
console.log("Groups:", customerGroups)
console.log("Has groups:", customerGroups.length > 0)
```

### Verify pricing data
```typescript
const variant = product.variants[0]
console.log("Calculated:", variant.calculated_price)
console.log("Original:", variant.original_price)
console.log("Price List ID:", variant.price_list_id)
console.log("Price List Type:", variant.price_list_type)
```

### Check auth state
```typescript
const auth = useAuth()
console.log("Is authenticated:", auth.isAuthenticated)
console.log("Is loading:", auth.isLoading)
console.log("Customer:", auth.customer)
```

## ⚡ Performance Tips

1. **Pass hasCustomerGroups prop efficiently:**
```typescript
// ✅ Good - calculate once at parent level
const { hasCustomerGroups } = useAuth()
products.map(p => <ProductCard hasCustomerGroupPricing={hasCustomerGroups} />)

// ❌ Bad - calling useAuth in each card
products.map(p => <ProductCard />) // then useAuth inside ProductCard
```

2. **Memoize price comparisons:**
```typescript
const priceComparison = useMemo(
  () => getPriceComparison(variant),
  [variant.calculated_price, variant.original_price]
)
```

3. **Conditional rendering:**
```typescript
// Only render group banner if needed
{hasCustomerGroups && <CustomerGroupBanner />}
```

## 🎯 Common Use Cases

### Show group-exclusive products
```typescript
function ExclusiveProducts() {
  const { hasCustomerGroups, customerGroups } = useAuth()
  
  if (!hasCustomerGroups) {
    return <p>Login to see exclusive products</p>
  }
  
  return (
    <div>
      <h2>{customerGroups[0].name} Exclusive Products</h2>
      {/* Render special products */}
    </div>
  )
}
```

### Different layouts per group
```typescript
function DynamicLayout() {
  const { customerGroups } = useAuth()
  const groupName = customerGroups[0]?.name
  
  if (groupName === "VIP") {
    return <VIPLayout />
  }
  if (groupName === "Wholesale") {
    return <WholesaleLayout />
  }
  return <DefaultLayout />
}
```

### Cart with group pricing
```typescript
function CartSummary({ cart }) {
  const { hasCustomerGroups } = useAuth()
  
  return (
    <div>
      {hasCustomerGroups && (
        <div className="bg-green-50 p-2 rounded mb-2">
          ✓ Group pricing applied
        </div>
      )}
      <p>Total: {cart.total}</p>
    </div>
  )
}
```

## 📱 Responsive Design

```typescript
// Compact on mobile, detailed on desktop
<ProductPrice
  {...priceProps}
  variant={isMobile ? "compact" : "detailed"}
  className={isMobile ? "text-sm" : "text-base"}
/>

// Hide badges on very small screens
<ProductPrice
  {...priceProps}
  showBadge={!isMobile}
/>
```

## 🧪 Testing

```typescript
// Mock auth context for testing
const mockAuth = {
  customer: mockCustomer,
  customerGroups: [{ id: "cg_1", name: "VIP" }],
  hasCustomerGroups: true,
  isAuthenticated: true,
}

// Test component with group pricing
render(
  <AuthContext.Provider value={mockAuth}>
    <ProductCard product={mockProduct} hasCustomerGroupPricing={true} />
  </AuthContext.Provider>
)
```

---

**Quick Links:**
- [Full Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Original Integration Guide](./STOREFRONT_PRICING_INTEGRATION.md)

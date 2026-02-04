import { cn } from "utils/cn"
import { calculateSavings, formatPrice, hasGroupPricing } from "utils/medusa-product-helpers"
import { HttpTypes } from "@medusajs/types"
import type { VariantWithPricing } from "types/medusa-extensions"

// Support both legacy format and new BaseCalculatedPriceSet format from Medusa
type LegacyPriceFormat = {
  amount: number
  currency_code: string
} | null | undefined

// BaseCalculatedPriceSet from Medusa uses calculated_amount instead of amount
type MedusaPriceFormat = {
  id?: string
  calculated_amount?: number | null
  original_amount?: number | null
  currency_code?: string | null
  is_calculated_price_price_list?: boolean
  is_calculated_price_tax_inclusive?: boolean
  calculated_price?: unknown
  original_price?: unknown
  [key: string]: unknown
} | null | undefined

interface ProductPricePropsLegacy {
  calculatedPrice: LegacyPriceFormat | MedusaPriceFormat
  originalPrice: LegacyPriceFormat | MedusaPriceFormat
  hasCustomerGroupPricing?: boolean
  priceListType?: "sale" | "override"
  className?: string
  showBadge?: boolean
  variant?: "default" | "compact" | "detailed"
}

interface ProductPricePropsWithVariant {
  variant: HttpTypes.StoreProductVariant | VariantWithPricing
  className?: string
  showBadge?: boolean
  displayVariant?: "default" | "compact" | "detailed"
}

type ProductPriceProps = ProductPricePropsLegacy | ProductPricePropsWithVariant

function isVariantProps(props: ProductPriceProps): props is ProductPricePropsWithVariant {
  return 'variant' in props && props.variant !== undefined && typeof props.variant === 'object' && 'id' in props.variant
}

/**
 * ProductPrice component displays pricing with customer group support.
 * Shows calculated price, original price (with strikethrough if different),
 * savings badge, and customer group indicator.
 */
export function ProductPrice(props: ProductPriceProps) {
  const className = props.className
  const showBadge = props.showBadge ?? true
  const displayVariant = isVariantProps(props) && props.displayVariant ? props.displayVariant : 
                         (!isVariantProps(props) && 'variant' in props && typeof props.variant === 'string' ? props.variant : 'default')
  
  let calculatedPrice: { amount: number; currency_code: string } | null | undefined
  let originalPrice: { amount: number; currency_code: string } | null | undefined
  let hasCustomerGroupPricing = false

  // Helper to normalize price formats (supports both legacy and Medusa BaseCalculatedPriceSet)
  const normalizePrice = (price: LegacyPriceFormat | MedusaPriceFormat): { amount: number; currency_code: string } | null => {
    if (!price) return null
    
    // Check for legacy format with 'amount' property
    if ('amount' in price && typeof price.amount === 'number') {
      return { amount: price.amount, currency_code: (price as { amount: number; currency_code: string }).currency_code }
    }
    
    // Check for Medusa BaseCalculatedPriceSet format with 'calculated_amount'
    if ('calculated_amount' in price && typeof price.calculated_amount === 'number') {
      return { amount: price.calculated_amount, currency_code: price.currency_code || 'DOP' }
    }
    
    // Check for original_amount (for original price)
    if ('original_amount' in price && typeof price.original_amount === 'number') {
      return { amount: price.original_amount, currency_code: price.currency_code || 'DOP' }
    }
    
    return null
  }
  
  // Extract prices from variant if provided
  if (isVariantProps(props)) {
    const variantData = props.variant as any
    calculatedPrice = normalizePrice(variantData.calculated_price)
    originalPrice = normalizePrice(variantData.original_price)
    hasCustomerGroupPricing = hasGroupPricing(variantData)
  } else {
    calculatedPrice = normalizePrice(props.calculatedPrice)
    originalPrice = normalizePrice(props.originalPrice)
    hasCustomerGroupPricing = props.hasCustomerGroupPricing ?? false
  }
  // Determine the effective current price
  // For override price lists, originalPrice IS the current price
  // For calculated/sale price lists, calculatedPrice is the current price
  let currentPrice = calculatedPrice
  
  // If calculated_price is missing but we have original_price, use it
  if (!currentPrice?.amount && originalPrice?.amount) {
    currentPrice = originalPrice
  }
  
  // If no prices configured at all
  if (!currentPrice && !originalPrice) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        Precio no disponible
      </span>
    )
  }
  
  if (!currentPrice) return null

  const hasDiscount =
    calculatedPrice &&
    originalPrice &&
    calculatedPrice.amount != null &&
    originalPrice.amount != null &&
    calculatedPrice.amount < originalPrice.amount

  const currency = currentPrice.currency_code || "DOP"

  // Calculate savings if there's a discount
  let savingsData: { savings: number; savingsPercent: number } | null = null
  if (hasDiscount && calculatedPrice && originalPrice) {
    savingsData = calculateSavings(calculatedPrice.amount, originalPrice.amount)
  }

  // Compact variant (for small cards)
  if (displayVariant === "compact") {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(currentPrice.amount, currency)}
          </span>
          {hasDiscount && originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice.amount, currency)}
            </span>
          )}
        </div>
        {hasDiscount && savingsData && showBadge && (
          <span className="text-xs font-medium text-green-600">
            Ahorras {savingsData.savingsPercent}%
          </span>
        )}
      </div>
    )
  }

  // Detailed variant (for product pages)
  if (displayVariant === "detailed") {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Current Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-foreground">
            {formatPrice(currentPrice.amount, currency)}
          </span>
          {hasDiscount && originalPrice && (
            <span className="text-xl text-muted-foreground line-through">
              {formatPrice(originalPrice.amount, currency)}
            </span>
          )}
        </div>

        {/* Savings and Badges */}
        {(hasDiscount || hasCustomerGroupPricing) && (
          <div className="flex flex-wrap items-center gap-2">
            {hasDiscount && savingsData && (
              <div className="rounded-md bg-green-50 px-3 py-1.5 border border-green-200">
                <p className="text-sm font-semibold text-green-700">
                  Ahorras {formatPrice(savingsData.savings, currency)} (
                  {savingsData.savingsPercent}%)
                </p>
              </div>
            )}
            {hasCustomerGroupPricing && showBadge && (
              <div className="rounded-md bg-blue-50 px-3 py-1.5 border border-blue-200">
                <p className="text-sm font-medium text-blue-700">
                  {hasDiscount ? "Precio de grupo" : "Precio exclusivo"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {/* Current Price */}
      <span className="text-2xl font-bold text-foreground">
        {formatPrice(currentPrice.amount, currency)}
      </span>

      {/* Original Price (strikethrough if discounted) */}
      {hasDiscount && originalPrice && (
        <span className="text-lg text-muted-foreground line-through">
          {formatPrice(originalPrice.amount, currency)}
        </span>
      )}

      {/* Discount Badge */}
      {hasDiscount && savingsData && showBadge && (
        <span className="rounded bg-green-500 px-2 py-1 text-xs font-bold text-white">
          {savingsData.savingsPercent}% OFF
        </span>
      )}

      {/* Customer Group Badge */}
      {hasCustomerGroupPricing && !hasDiscount && showBadge && (
        <span className="rounded bg-blue-500 px-2 py-1 text-xs font-bold text-white">
          GRUPO
        </span>
      )}
    </div>
  )
}

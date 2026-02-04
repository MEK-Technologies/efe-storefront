import { HttpTypes } from "@medusajs/types"
import { type CurrencyType, mapCurrencyToSign } from "./map-currency-to-sign"
import type { PriceComparison, VariantWithPricing } from "../types/medusa-extensions"

/**
 * Get the featured image from a Medusa product.
 * Uses thumbnail if available, otherwise falls back to first image.
 */
export function getFeaturedImage(
  product: HttpTypes.StoreProduct
): { url: string; alt: string } | null {
  if (product.thumbnail) {
    return { url: product.thumbnail, alt: product.title ?? "" }
  }
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0]
    return { url: firstImage.url, alt: product.title ?? "" }
  }
  return null
}

/**
 * Get the minimum price from product variants using calculated_price.
 * Returns the lowest price among all variants.
 */
export function getMinPrice(
  variants: HttpTypes.StoreProductVariant[] | null | undefined
): { amount: number; currencyCode: string } | null {
  if (!variants || variants.length === 0) return null

  const pricesWithValues = variants
    .filter((v) => v.calculated_price?.calculated_amount != null)
    .map((v) => ({
      amount: v.calculated_price!.calculated_amount!,
      currencyCode: v.calculated_price!.currency_code || "USD",
    }))

  if (pricesWithValues.length === 0) return null

  return pricesWithValues.reduce((min, current) =>
    current.amount < min.amount ? current : min
  )
}

/**
 * Format price using Intl.NumberFormat for proper locale formatting.
 */
export function formatPriceLocale(
  amount: number,
  currencyCode: string,
  locale?: string
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(amount)
}

/**
 * Get variant price information.
 * Handles both calculated prices and override prices.
 */
export function getVariantPrice(
  variant: HttpTypes.StoreProductVariant | null | undefined
): { amount: number; currencyCode: string } | null {
  if (!variant) return null

  // Try calculated_price first
  if (variant.calculated_price?.calculated_amount != null) {
    return {
      amount: variant.calculated_price.calculated_amount,
      currencyCode: variant.calculated_price.currency_code || "DOP",
    }
  }

  // Fallback to original_price (used in override price lists)
  const variantWithPricing = variant as any
  if (variantWithPricing.original_price?.original_amount != null) {
    return {
      amount: variantWithPricing.original_price.original_amount,
      currencyCode: variantWithPricing.original_price.currency_code || "DOP",
    }
  }

  return null
}

/**
 * Check if a variant is available for sale.
 */
export function isVariantAvailable(
  variant: HttpTypes.StoreProductVariant | null | undefined
): boolean {
  if (!variant) return false
  // Check inventory if manage_inventory is enabled
  if (variant.manage_inventory && variant.inventory_quantity != null) {
    return variant.inventory_quantity > 0
  }
  // If inventory is not managed, assume available
  return true
}

/**
 * Check if a variant has customer group pricing applied.
 * Compares calculated_price with original_price to detect pricing differences.
 */
export function hasGroupPricing(
  variant: HttpTypes.StoreProductVariant | VariantWithPricing
): boolean {
  const variantWithPricing = variant as VariantWithPricing
  
  if (!variant.calculated_price?.calculated_amount) return false
  if (!variantWithPricing.original_price?.original_amount) return false
  
  return variant.calculated_price.calculated_amount !== variantWithPricing.original_price.original_amount
}

/**
 * Calculate savings amount and percentage.
 * Returns the difference between original and calculated price.
 */
export function calculateSavings(
  calculatedAmount: number,
  originalAmount: number
): { savings: number; savingsPercent: number } {
  const savings = originalAmount - calculatedAmount
  const savingsPercent = Number(((savings / originalAmount) * 100).toFixed(0))
  
  return { savings, savingsPercent }
}

/**
 * Get comprehensive price comparison data for a variant.
 * Includes calculated, original, savings, and price list metadata.
 * Handles both calculated and override price list types.
 */
export function getPriceComparison(
  variant: HttpTypes.StoreProductVariant | VariantWithPricing
): PriceComparison {
  const variantWithPricing = variant as VariantWithPricing
  
  // For override price lists, the final price is in original_price
  // For sale/calculated price lists, use calculated_price
  let calculated = variant.calculated_price?.calculated_amount ?? undefined
  const original = variantWithPricing.original_price?.original_amount ?? undefined
  
  // If calculated is undefined but we have original_price, use it as the final price
  if (calculated == null && original != null) {
    calculated = original
  }
  
  const hasDifference = hasGroupPricing(variant)
  
  let savings: number | undefined
  let savingsPercent: number | undefined
  
  if (calculated && original && hasDifference) {
    const savingsData = calculateSavings(calculated, original)
    savings = savingsData.savings
    savingsPercent = savingsData.savingsPercent
  }
  
  return {
    calculated,
    original,
    hasDifference,
    priceListType: variantWithPricing.price_list_type,
    savings,
    savingsPercent,
  }
}

/**
 * Format price to currency string.
 * Medusa prices come in decimal format (246.93, 150.00).
 * DO NOT divide by 100 - prices are already in correct format.
 */
export function formatPrice(
  amount: number | null | undefined,
  currencyCode: string = "DOP",
  locale: string = "es-DO"
): string {
  if (amount == null || isNaN(amount)) {
    return "Precio no disponible"
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

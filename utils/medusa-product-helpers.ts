import { HttpTypes } from "@medusajs/types"
import { type CurrencyType, mapCurrencyToSign } from "./map-currency-to-sign"

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
 * Format price with currency symbol.
 * Medusa prices may be in cents or full amounts depending on configuration.
 */
export function formatPrice(amount: number, currencyCode: string): string {
  const symbol = mapCurrencyToSign((currencyCode as CurrencyType) || "USD")
  return `${symbol}${amount.toFixed(0)}`
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
 */
export function getVariantPrice(
  variant: HttpTypes.StoreProductVariant | null | undefined
): { amount: number; currencyCode: string } | null {
  if (!variant?.calculated_price?.calculated_amount) return null

  return {
    amount: variant.calculated_price.calculated_amount,
    currencyCode: variant.calculated_price.currency_code || "USD",
  }
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

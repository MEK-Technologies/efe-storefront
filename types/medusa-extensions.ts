/**
 * Type extensions for Medusa customer group pricing integration
 * Extends base Medusa types with pricing metadata from custom backend endpoints
 */

import { HttpTypes } from "@medusajs/types"

/**
 * Extended variant type with customer group pricing fields
 * Includes original_price for comparison and price_list metadata
 */
export interface VariantWithPricing extends HttpTypes.StoreProductVariant {
  original_price?: {
    original_amount: number
    currency_code: string
  }
  price_list_id?: string
  price_list_type?: "sale" | "override"
}

/**
 * Response from /store/products endpoint with customer group pricing metadata
 * Includes flag indicating if group pricing was applied and which group
 */
export interface ProductsWithGroupPricing {
  products: HttpTypes.StoreProduct[]
  count: number
  limit: number
  offset: number
  has_customer_group_pricing: boolean
  customer_group_id: string | null
}

/**
 * Customer group reference
 */
export interface CustomerGroup {
  id: string
  name: string
}

/**
 * Customer data extended with groups from /store/customer/profile endpoint
 */
export interface CustomerWithGroups extends HttpTypes.StoreCustomer {
  groups: CustomerGroup[]
}

/**
 * Price comparison data for a variant
 */
export interface PriceComparison {
  calculated: number | undefined
  original: number | undefined
  hasDifference: boolean
  priceListType?: "sale" | "override"
  savings?: number
  savingsPercent?: number
}

/**
 * Product query parameters for fetching with pricing
 */
export interface ProductsParams {
  limit?: number
  offset?: number
  category_id?: string
  region_id?: string
}

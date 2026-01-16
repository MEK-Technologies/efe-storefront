import { HttpTypes } from "@medusajs/types"

// Re-exporting Medusa's product type as the base with review augmentations
export type CommerceProduct = HttpTypes.StoreProduct

// Convenience type aliases for commonly used Medusa SDK types
export type StoreProduct = HttpTypes.StoreProduct
export type StoreProductVariant = HttpTypes.StoreProductVariant
export type StoreCollection = HttpTypes.StoreCollection
export type StoreProductCategory = HttpTypes.StoreProductCategory
export type StoreRegion = HttpTypes.StoreRegion
export type StoreCart = HttpTypes.StoreCart
export type StoreLineItem = HttpTypes.StoreCartLineItem
export type StoreOrder = HttpTypes.StoreOrder
export type StoreShippingOption = HttpTypes.StoreShippingOption
export type StorePaymentProvider = HttpTypes.StorePaymentProvider
export type StoreCustomer = HttpTypes.StoreCustomer

export type SearchParamsType = Record<string, string | string[] | undefined>
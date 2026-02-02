"use server"

import { HttpTypes } from "@medusajs/types"
import { retrieveVariant } from "./variants"

/**
 * Get available stock for a variant by checking inventory_items location_levels
 * @param variantId - The variant ID to check
 * @returns Available quantity across all locations
 */
export async function getVariantAvailableStock(variantId: string): Promise<number> {
  const variant = await retrieveVariant(variantId)
  
  if (!variant || !variant.manage_inventory) {
    return Number.POSITIVE_INFINITY
  }

  // @ts-expect-error - inventory_items exists in response but not in types
  const inventoryItems = variant.inventory_items || []
  
  if (inventoryItems.length === 0) {
    // No inventory items, check legacy inventory_quantity
    return variant.inventory_quantity ?? Number.POSITIVE_INFINITY
  }

  // Sum available quantity from all location levels
  const totalAvailable = inventoryItems.reduce((total: number, item: any) => {
    const locationLevels = item.inventory?.location_levels || []
    const itemStock = locationLevels.reduce((sum: number, level: any) => {
      return sum + (level.available_quantity || 0)
    }, 0)
    return total + itemStock
  }, 0)

  return totalAvailable
}

/**
 * Validate cart items have sufficient inventory before checkout
 * @param cart - The cart to validate
 * @returns Validation result with any errors
 */
export async function validateCartInventory(cart: HttpTypes.StoreCart): Promise<{
  isValid: boolean
  errors: Array<{
    item_id: string
    title: string
    message: string
    available_quantity: number
    requested_quantity: number
  }>
}> {
  if (!cart.items || cart.items.length === 0) {
    return { isValid: true, errors: [] }
  }

  const errors: Array<{
    item_id: string
    title: string
    message: string
    available_quantity: number
    requested_quantity: number
  }> = []

  // Check each cart item
  for (const item of cart.items) {
    if (!item.variant_id) continue

    const availableStock = await getVariantAvailableStock(item.variant_id)
    
    // Check if requested quantity exceeds available stock
    if (availableStock !== Number.POSITIVE_INFINITY && item.quantity > availableStock) {
      errors.push({
        item_id: item.id,
        title: item.title || "Unknown Product",
        message:
          availableStock === 0
            ? "Out of stock"
            : `Only ${availableStock} available`,
        available_quantity: availableStock,
        requested_quantity: item.quantity,
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

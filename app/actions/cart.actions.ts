"use server"

import { COOKIE_CART_ID, TAGS } from "constants/index"
import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { isDemoMode } from "utils/demo-utils"
import { addToCart, deleteLineItem, getOrSetCart, retrieveCart, updateLineItem } from "lib/medusa/data/cart"
import { retrieveVariant } from "lib/medusa/data/variants"

/**
 * Retrieves the current cart if it exists.
 * 
 * NOTE: This function uses LAZY INITIALIZATION pattern.
 * - It only retrieves the cart, does NOT create it
 * - Cart is created when user adds first item (see addCartItem)
 * - This prevents creating unnecessary carts for browsing users
 * 
 * @returns Object with cartId and cart (null if no cart exists yet)
 */
export async function getCart() {
  const cartId = (await cookies()).get(COOKIE_CART_ID)?.value
  const cart = await retrieveCart(cartId)

  return { cartId: cart?.id, cart }
}

export async function getItemAvailability({
  cartId,
  variantId,
  productId: _productId,
}: {
  cartId: string | null | undefined
  variantId: string | null | undefined
  productId: string | null | undefined
}) {
  console.log("[getItemAvailability] Starting:", { cartId, variantId, productId: _productId })
  
  if (!variantId) {
    console.warn("[getItemAvailability] No variantId provided")
    return { inCartQuantity: 0, inStockQuantity: 0 }
  }

  // Fetch variant from Medusa to check inventory
  const variant = await retrieveVariant(variantId)
  
  if (!variant) {
    console.error("[getItemAvailability] Variant not found:", variantId)
    return { inCartQuantity: 0, inStockQuantity: 0 }
  }

  // Calculate stock from inventory_items location_levels
  let inStockQuantity = Number.POSITIVE_INFINITY
  
  if (variant.manage_inventory) {
    // @ts-expect-error - inventory_items exists in response but not in types
    const inventoryItems = variant.inventory_items || []
    
    console.log("[getItemAvailability] Variant manages inventory:", {
      inventoryItemsCount: inventoryItems.length,
      inventory_quantity: variant.inventory_quantity
    })
    
    if (inventoryItems.length > 0) {
      // Sum available quantity from all location levels
      inStockQuantity = inventoryItems.reduce((total: number, item: any) => {
        const locationLevels = item.inventory?.location_levels || []
        const itemStock = locationLevels.reduce((sum: number, level: any) => {
          return sum + (level.available_quantity || 0)
        }, 0)
        console.log("[getItemAvailability] Inventory item stock:", { itemStock, locationLevelsCount: locationLevels.length })
        return total + itemStock
      }, 0)
    } else if (variant.inventory_quantity != null) {
      // Fallback to variant.inventory_quantity if available
      inStockQuantity = variant.inventory_quantity
      console.log("[getItemAvailability] Using variant.inventory_quantity:", inStockQuantity)
    } else {
      // No inventory data available, but manage_inventory is true
      // This likely means stock is 0
      inStockQuantity = 0
      console.warn("[getItemAvailability] manage_inventory=true but no inventory data")
    }
  } else {
    console.log("[getItemAvailability] Variant does NOT manage inventory (unlimited stock)")
  }

  let inCartQuantity = 0

  if (cartId) {
    const cart = await retrieveCart(cartId)
    const cartItem = cart?.items?.find((item) => item.variant_id === variantId)
    inCartQuantity = cartItem?.quantity ?? 0
  }

  const result = {
    inCartQuantity,
    inStockQuantity,
  }
  
  console.log("[getItemAvailability] Result:", result)
  return result
}

/**
 * Adds an item to the cart. Creates cart if it doesn't exist (LAZY INITIALIZATION).
 * 
 * This is where cart creation happens:
 * - getOrSetCart() creates cart if no cookie exists
 * - Sets _medusa_cart_id cookie for future requests
 * - Validates stock availability before adding
 * 
 * @param prevState - Previous form state (unused)
 * @param variantId - Product variant ID to add
 * @param productId - Product ID (for stock checking)
 * @param countryCode - Country code for cart region
 */
export async function addCartItem(prevState: any, variantId: string, productId: string, countryCode: string) {
  console.log("[addCartItem] Starting:", { variantId, productId, countryCode })
  
  if (isDemoMode()) {
    console.log("[addCartItem] Demo mode active, blocking")
    return {
      ok: false,
      message: "Demo mode active. Filtering, searching, and adding to cart disabled.",
    }
  }

  if (!variantId) {
    console.warn("[addCartItem] No variantId provided")
    return { ok: false }
  }
  
  // countryCode is required for getOrSetCart in Medusa
  const code = countryCode || "us"

  try {
    // This creates the cart if it doesn't exist (lazy initialization)
    console.log("[addCartItem] Getting or creating cart with countryCode:", code)
    const cart = await getOrSetCart(code)
    if (!cart) {
      console.error("[addCartItem] Failed to create cart")
      return { ok: false, message: "Could not create cart" }
    }
    const cartId = cart.id
    console.log("[addCartItem] Cart ready:", cartId)

    const availability = await getItemAvailability({
      cartId,
      variantId,
      productId,
    })

    console.log("[addCartItem] Stock check result:", {
      availability,
      check: `${availability.inCartQuantity} >= ${availability.inStockQuantity}`,
      willBlock: !availability || availability.inCartQuantity >= availability.inStockQuantity
    })

    if (!availability || availability.inCartQuantity >= availability.inStockQuantity) {
      console.warn("[addCartItem] Blocking: Out of stock")
      return {
        ok: false,
        message: "This product is out of stock",
      }
    }

    console.log("[addCartItem] Adding to cart...")
    await addToCart({ variantId, quantity: 1, countryCode })
    revalidateTag(TAGS.CART)

    console.log("[addCartItem] Success! Item added to cart")
    return { ok: true }
  } catch (e) {
    console.error("Error adding to cart", e)
    return { ok: false, message: "Error adding to cart" }
  }
}

export async function removeCartItem(prevState: any, itemId: string) {
  const cartId = (await cookies()).get(COOKIE_CART_ID)?.value
  if (!cartId) return { ok: false }

  await deleteLineItem(itemId)
  revalidateTag(TAGS.CART)

  return { ok: true }
}

export async function updateItemQuantity(
  prevState: any,
  payload: {
    itemId: string
    variantId: string
    quantity: number
    productId: string
  }
) {
  const cartId = (await cookies()).get(COOKIE_CART_ID)?.value
  if (!cartId) return { ok: false }

  const { itemId, variantId, quantity, productId } = payload

  if (quantity === 0) {
    await deleteLineItem(itemId)
    revalidateTag(TAGS.CART)
    return { ok: true }
  }

  const itemAvailability = await getItemAvailability({
    cartId,
    variantId,
    productId,
  })

  // Check if we can increase to 'quantity'
  // Note: itemAvailability includes CURRENT cart quantity. 
  // If we update to 'quantity', we need to check if 'quantity' <= inStockQuantity.
  // Wait, getItemAvailability returns (inCart, inStock).
  // If inCart is 5, and inStock is 10. We want to update to 6. Valid.
  // We just need to check if quantity <= inStockQuantity.
  
  if (!itemAvailability || quantity > itemAvailability.inStockQuantity) {
    return {
      ok: false,
      message: "This product is out of stock",
    }
  }

  await updateLineItem({ lineId: itemId, quantity })
  revalidateTag(TAGS.CART)

  return { ok: true }
}

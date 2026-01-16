"use server"

import { COOKIE_CART_ID, TAGS } from "constants/index"
import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { isDemoMode } from "utils/demo-utils"
import { addToCart, deleteLineItem, getOrSetCart, retrieveCart, updateLineItem } from "lib/medusa/data/cart"
import { retrieveVariant } from "lib/medusa/data/variants"
import { HttpTypes } from "@medusajs/types"

export async function getOrCreateCart() {
  const cartId = (await cookies()).get(COOKIE_CART_ID)?.value
  const cart = await retrieveCart(cartId)

  // Medusa uses retrieveCart which handles cookies internally for ID if not provided?
  // Actually, retrieveCart(id) 
  // If we want to create, we need countryCode. 
  // For 'viewing' cart (CartView), we just retrieve.

  return { cartId: cart?.id, cart }
}

export async function getItemAvailability({
  cartId,
  variantId,
  productId,
}: {
  cartId: string | null | undefined
  variantId: string | null | undefined
  productId: string | null | undefined
}) {
  if (!variantId) {
    return { inCartQuantity: 0, inStockQuantity: 0 }
  }

  // Fetch variant from Medusa to check inventory
  const variant = await retrieveVariant(variantId)
  
  if (!variant) {
     return { inCartQuantity: 0, inStockQuantity: 0 }
  }

  const inStockQuantity = variant.manage_inventory && variant.inventory_quantity != null 
    ? variant.inventory_quantity 
    : Number.POSITIVE_INFINITY

  let inCartQuantity = 0

  if (cartId) {
    const cart = await retrieveCart(cartId)
    const cartItem = cart?.items?.find((item) => item.variant_id === variantId)
    inCartQuantity = cartItem?.quantity ?? 0
  }

  return {
    inCartQuantity,
    inStockQuantity,
  }
}

export async function addCartItem(prevState: any, variantId: string, productId: string, countryCode: string) {
  if (isDemoMode()) {
    return {
      ok: false,
      message: "Demo mode active. Filtering, searching, and adding to cart disabled.",
    }
  }

  if (!variantId) return { ok: false }
  
  // countryCode is required for getOrSetCart in Medusa
  const code = countryCode || "us"

  try {
    const cart = await getOrSetCart(code)
    if (!cart) return { ok: false, message: "Could not create cart" }
    const cartId = cart.id

    const availability = await getItemAvailability({
      cartId,
      variantId,
      productId,
    })

    if (!availability || availability.inCartQuantity >= availability.inStockQuantity) {
      return {
        ok: false,
        message: "This product is out of stock",
      }
    }

    await addToCart({ variantId, quantity: 1, countryCode })
    revalidateTag(TAGS.CART)

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

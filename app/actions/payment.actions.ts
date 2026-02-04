"use server"

import { initiatePaymentSession, placeOrder, retrieveCart } from "lib/medusa/data/cart"
import { getCartId } from "lib/medusa/data/cookies"
import { validateCartInventory } from "lib/medusa/data/inventory"

export async function initializePayment(): Promise<{
  ok: boolean
  clientSecret?: string
  error?: string
}> {
  const cartId = await getCartId()

  if (!cartId) {
    return { ok: false, error: "No cart found" }
  }

  try {
    const cart = await retrieveCart(cartId)

    if (!cart) {
      return { ok: false, error: "Cart not found" }
    }

    // Validate cart has required data
    if (!cart.email) {
      return { ok: false, error: "Email is required" }
    }

    if (!cart.shipping_address) {
      return { ok: false, error: "Shipping address is required" }
    }

    // Skip payment session initialization - not required for manual payment flow
    // If payment provider is configured, uncomment the following:
    /*
    const paymentSession = await initiatePaymentSession(cart, {
      provider_id: "stripe",
    })
    const clientSecret = "placeholder_client_secret"
    */

    return { ok: true, clientSecret: undefined }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Payment initialization failed" }
  }
}

export async function completePayment(): Promise<{
  ok: boolean
  orderId?: string
  error?: string
  inventoryErrors?: Array<{
    item_id: string
    title: string
    message: string
    available_quantity: number
    requested_quantity: number
  }>
}> {
  const cartId = await getCartId()

  if (!cartId) {
    return { ok: false, error: "No cart found" }
  }

  try {
    // Get cart to validate
    const cart = await retrieveCart(cartId)

    if (!cart) {
      return { ok: false, error: "Cart not found" }
    }

    console.log("[completePayment] Cart data:", {
      id: cart.id,
      email: cart.email,
      hasShippingAddress: !!cart.shipping_address,
      hasShippingMethod: (cart.shipping_methods?.length ?? 0) > 0,
      itemCount: cart.items?.length,
      total: cart.total,
    })

    // Validate inventory availability before placing order
    const validation = await validateCartInventory(cart)

    if (!validation.isValid) {
      return {
        ok: false,
        error: "Some items are out of stock or have insufficient quantity",
        inventoryErrors: validation.errors,
      }
    }

    // Place the order
    await placeOrder(cartId)

    // placeOrder redirects on success, so if we reach here something went wrong
    return { ok: false, error: "Failed to complete order" }
  } catch (e) {
    // If error is due to redirect, this is actually success
    // Next.js throws NEXT_REDIRECT on redirect() calls
    if (e && typeof e === "object" && "digest" in e) {
      // This is a redirect, which means success
      throw e
    }

    return { ok: false, error: e instanceof Error ? e.message : "Order completion failed" }
  }
}

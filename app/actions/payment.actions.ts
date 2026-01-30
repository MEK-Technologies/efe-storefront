"use server"

import { initiatePaymentSession, placeOrder, retrieveCart } from "lib/medusa/data/cart"
import { getCartId } from "lib/medusa/data/cookies"

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

    // Initialize payment session
    const paymentSession = await initiatePaymentSession(cart, {
      provider_id: "stripe", // TODO: Make this configurable
    })

    // For now, return a placeholder client secret
    // TODO: Extract actual client_secret from payment session once Stripe is configured
    const clientSecret = "placeholder_client_secret"

    return { ok: true, clientSecret }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Payment initialization failed" }
  }
}

export async function completePayment(): Promise<{
  ok: boolean
  orderId?: string
  error?: string
}> {
  const cartId = await getCartId()

  if (!cartId) {
    return { ok: false, error: "No cart found" }
  }

  try {
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

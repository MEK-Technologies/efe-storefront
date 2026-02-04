"use server"

import { sdk } from "lib/medusa/config"
import { revalidateTag } from "next/cache"
import { TAGS } from "constants/index"
import { getAuthHeaders, getCacheTag, getCartId } from "lib/medusa/data/cookies"
import { HttpTypes } from "@medusajs/types"

export async function updateCartEmail(
  prevState: any,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const email = formData.get("email") as string

  if (!email) {
    return { ok: false, error: "Email is required" }
  }

  const cartId = await getCartId()

  if (!cartId) {
    return { ok: false, error: "No cart found" }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    await sdk.store.cart.update(cartId, { email }, {}, headers)
    revalidateTag(TAGS.CART)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to update email" }
  }
}

export async function updateShippingAddress(
  prevState: any,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const cartId = await getCartId()

  if (!cartId) {
    return { ok: false, error: "No cart found" }
  }

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    address_1: formData.get("address_1") as string,
    address_2: (formData.get("address_2") as string) || "",
    city: formData.get("city") as string,
    province: (formData.get("province") as string) || "",
    postal_code: formData.get("postal_code") as string,
    country_code: formData.get("country_code") as string,
    phone: (formData.get("phone") as string) || "",
  }

  // Validate required fields
  if (
    !address.first_name ||
    !address.last_name ||
    !address.address_1 ||
    !address.city ||
    !address.postal_code ||
    !address.country_code
  ) {
    return { ok: false, error: "All required address fields must be filled" }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    await sdk.store.cart.update(cartId, { shipping_address: address }, {}, headers)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to update shipping address" }
  }
}

export async function updateBillingAddress(
  prevState: any,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const cartId = await getCartId()

  if (!cartId) {
    return { ok: false, error: "No cart found" }
  }

  const address = {
    first_name: formData.get("billing_first_name") as string,
    last_name: formData.get("billing_last_name") as string,
    address_1: formData.get("billing_address_1") as string,
    address_2: (formData.get("billing_address_2") as string) || "",
    city: formData.get("billing_city") as string,
    province: (formData.get("billing_province") as string) || "",
    postal_code: formData.get("billing_postal_code") as string,
    country_code: formData.get("billing_country_code") as string,
    phone: (formData.get("billing_phone") as string) || "",
  }

  // Validate required fields
  if (
    !address.first_name ||
    !address.last_name ||
    !address.address_1 ||
    !address.city ||
    !address.postal_code ||
    !address.country_code
  ) {
    return { ok: false, error: "All required billing address fields must be filled" }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    await sdk.store.cart.update(cartId, { billing_address: address }, {}, headers)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to update billing address" }
  }
}

export async function selectShippingMethod(
  prevState: any,
  optionId: string
): Promise<{ ok: boolean; error?: string }> {
  const cartId = await getCartId()

  if (!cartId) {
    return { ok: false, error: "No cart found" }
  }

  if (!optionId) {
    return { ok: false, error: "Shipping option is required" }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    await sdk.store.cart.addShippingMethod(cartId, { option_id: optionId }, {}, headers)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to select shipping method" }
  }
}

export async function getShippingOptions(): Promise<{
  ok: boolean
  options?: HttpTypes.StoreCartShippingOption[]
  error?: string
}> {
  const cartId = await getCartId()

  if (!cartId) {
    return { ok: false, error: "No cart found" }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const response = await sdk.client.fetch<{
      shipping_options: HttpTypes.StoreCartShippingOption[]
    }>("/store/shipping-options", {
      query: { cart_id: cartId },
      headers,
      cache: "no-store",
    })

    return { ok: true, options: response.shipping_options }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to fetch shipping options" }
  }
}

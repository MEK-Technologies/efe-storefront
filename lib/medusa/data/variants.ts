"use server"

import { sdk } from "../config"
import { HttpTypes } from "@medusajs/types"

import { getAuthHeaders, getCacheOptions } from "./cookies"

export const retrieveVariant = async (
  variant_id: string
): Promise<HttpTypes.StoreProductVariant | null> => {
  const authHeaders = await getAuthHeaders()

  if (!authHeaders) {
    console.warn("[retrieveVariant] No auth headers available")
    // Continue without auth headers for public endpoints
  }

  const headers = {
    ...authHeaders,
  }

  const next = {
    ...(await getCacheOptions("variants")),
  }

  return await sdk.client
    .fetch<{ variant: HttpTypes.StoreProductVariant }>(
      `/store/product-variants/${variant_id}`,
      {
        method: "GET",
        query: {
          fields: "*images,*inventory_items.inventory.location_levels",
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ variant }) => {
      console.log("[retrieveVariant] Success:", {
        variant_id,
        manage_inventory: variant.manage_inventory,
        inventory_quantity: variant.inventory_quantity,
        // @ts-expect-error - inventory_items exists in response but not in types
        has_inventory_items: !!variant.inventory_items,
      })
      return variant
    })
    .catch((error) => {
      console.error("[retrieveVariant] Failed for variant", variant_id, error)
      return null
    })
}

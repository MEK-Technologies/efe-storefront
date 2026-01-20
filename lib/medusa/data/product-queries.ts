/**
 * Product query functions for static generation and product pages
 * These replace Algolia queries with Medusa equivalents
 */

"use server"

import { sdk } from "../config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"
import { DEFAULT_COUNTRY_CODE } from "constants/index"
import { getRegion } from "./regions"

/**
 * Get a single product by its handle
 */
export async function getProductByHandle(handle: string): Promise<HttpTypes.StoreProduct | null> {
  const next = {
    ...(await getCacheOptions("products")),
  }

  const region = await getRegion(DEFAULT_COUNTRY_CODE)
  
  if (!region) {
    console.error(`Region not found for country code: ${DEFAULT_COUNTRY_CODE}`)
    return null
  }

  try {
    const response = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          handle,
          region_id: region.id,
          fields: "*variants,*variants.calculated_price,+variants.inventory_quantity,*variants.images,*images,*collection,+metadata,+tags",
          limit: 1,
        },
        next,
        cache: "force-cache",
      }
    )

    return response.products[0] || null
  } catch (error) {
    console.error(`Error fetching product by handle: ${handle}`, error)
    return null
  }
}

/**
 * Get all product handles for static generation
 * Used in generateStaticParams
 */
export async function getAllProductHandles(limit: number = 100): Promise<string[]> {
  const next = {
    ...(await getCacheOptions("products")),
  }

  const region = await getRegion(DEFAULT_COUNTRY_CODE)
  
  if (!region) {
    console.error(`Region not found for country code: ${DEFAULT_COUNTRY_CODE}`)
    return []
  }

  try {
    const response = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          region_id: region.id,
          fields: "handle",
          limit,
        },
        next,
        cache: "force-cache",
      }
    )

    return response.products
      .map(p => p.handle)
      .filter((handle): handle is string => !!handle)
  } catch (error) {
    console.error("Error fetching product handles", error)
    return []
  }
}

/**
 * Get products by collection handle
 * Used for similar products sections
 */
export async function getProductsByCollection(
  collectionHandle: string,
  limit: number = 10,
  excludeProductId?: string
): Promise<HttpTypes.StoreProduct[]> {
  const next = {
    ...(await getCacheOptions("products")),
  }

  const region = await getRegion(DEFAULT_COUNTRY_CODE)
  
  if (!region) {
    return []
  }

  try {
    // First get the collection by handle
    const collectionResponse = await sdk.client.fetch<{ collections: HttpTypes.StoreCollection[] }>(
      `/store/collections`,
      {
        method: "GET",
        query: {
          handle: collectionHandle,
          fields: "id",
          limit: 1,
        },
        next,
        cache: "force-cache",
      }
    )

    const collection = collectionResponse.collections[0]
    
    if (!collection) {
      return []
    }

    // Then get products from that collection
    const productsResponse = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          collection_id: [collection.id],
          region_id: region.id,
          fields: "*variants,*variants.calculated_price,*images,+metadata",
          limit,
        },
        next,
        cache: "force-cache",
      }
    )

    // Filter out the current product if excludeProductId is provided
    return excludeProductId
      ? productsResponse.products.filter(p => p.id !== excludeProductId)
      : productsResponse.products
  } catch (error) {
    console.error(`Error fetching products by collection: ${collectionHandle}`, error)
    return []
  }
}

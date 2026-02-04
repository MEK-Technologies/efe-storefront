/**
 * Product query functions for static generation and product pages
 * These replace Algolia queries with Medusa equivalents
 */

"use server"

import { sdk } from "../config"
import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { DEFAULT_COUNTRY_CODE } from "constants/index"
import { getRegion } from "./regions"

/**
 * Get a single product by its handle
 */
export async function getProductByHandle(handle: string): Promise<HttpTypes.StoreProduct | null> {
  console.log('[getProductByHandle] Fetching product with handle:', handle)
  
  const next = {
    ...(await getCacheOptions("products")),
  }

  const region = await getRegion(DEFAULT_COUNTRY_CODE)
  
  if (!region) {
    console.error(`Region not found for country code: ${DEFAULT_COUNTRY_CODE}`)
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const response = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>
      (`/store/products`,
      {
        method: "GET",
        query: {
          handle,
          region_id: region.id,
          fields: "*variants,*variants.calculated_price,*variants.original_price,+variants.inventory_quantity,*variants.images,*images,*collection,+metadata,+tags",
          limit: 100, // Increase limit to find the correct product
        },
        headers,
        next,
        cache: "no-cache",
      }
    )

    // WORKAROUND: Backend is not filtering by handle correctly, so we filter here
    const product = response.products.find(p => p.handle === handle) || null
    console.log('[getProductByHandle] Received product:', product?.handle, product?.title)
    
    return product
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

/**
 * Get products by collection ID (not handle)
 * Used when you have the Medusa collection ID directly
 */
export async function getProductsByCollectionId(
  collectionId: string,
  limit: number = 12
): Promise<HttpTypes.StoreProduct[]> {
  const next = {
    ...(await getCacheOptions("products")),
  }

  const region = await getRegion(DEFAULT_COUNTRY_CODE)
  
  if (!region) {
    return []
  }

  try {
    const productsResponse = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          collection_id: [collectionId],
          region_id: region.id,
          fields: "*variants,*variants.calculated_price,*images,+metadata",
          limit,
        },
        next,
        cache: "force-cache",
      }
    )

    return productsResponse.products
  } catch (error) {
    console.error(`Error fetching products by collection ID: ${collectionId}`, error)
    return []
  }
}

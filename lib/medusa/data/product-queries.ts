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
import { listProducts } from "./products"

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
    // Try with a higher limit to ensure we get all products
    const response = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>
      (`/store/products`,
      {
        method: "GET",
        query: {
          handle,
          region_id: region.id,
          fields: "*variants,*variants.calculated_price,*variants.original_price,+variants.inventory_quantity,*variants.images,*images,*collection,+metadata,+tags",
          limit: 1000, // Increased limit to find the correct product
        },
        headers,
        next,
        cache: "no-cache",
      }
    )

    console.log('[getProductByHandle] Total products received:', response.products.length)
    if (response.products.length > 0) {
        console.log('[getProductByHandle] First 3 handles:', response.products.slice(0, 3).map(p => p.handle))
        const found = response.products.find(p => p.handle === handle)
        console.log('[getProductByHandle] Direct find result:', found ? 'FOUND' : 'NOT FOUND')
        // Check if it exists with slight variations
        const exactMatch = response.products.find(p => p.handle === handle)
        const caseMatch = response.products.find(p => p.handle?.toLowerCase() === handle.toLowerCase())
        console.log(`[getProductByHandle] Diagnostic: Exact=${!!exactMatch}, Case=${!!caseMatch}`)
    } else {
        console.warn('[getProductByHandle] NO PRODUCTS RETURNED from fetching with handle param')
    }

    // WORKAROUND: Backend is not filtering by handle correctly, so we filter here
    // Try exact match first
    let product = response.products.find(p => p.handle === handle) || null
    
    // If not found, try case-insensitive match
    if (!product) {
      console.log('[getProductByHandle] Exact match not found, trying case-insensitive')
      product = response.products.find(p => p.handle?.toLowerCase() === handle.toLowerCase()) || null
    }
    
    // If still not found, try partial match (handle contains the search term)
    if (!product) {
      console.log('[getProductByHandle] Case-insensitive match not found, trying partial match')
      product = response.products.find(p => p.handle?.toLowerCase().includes(handle.toLowerCase())) || null
    }
    
    console.log('[getProductByHandle] Final result:', product?.handle, product?.title)
    
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
  try {
    const next = {
      ...(await getCacheOptions("products")),
    }

    const region = await getRegion(DEFAULT_COUNTRY_CODE)
    
    if (!region) {
      console.error(`Region not found for country code: ${DEFAULT_COUNTRY_CODE}`)
      return []
    }

    // Add timeout to prevent hanging during build
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

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
          signal: controller.signal,
        }
      )

      clearTimeout(timeoutId)
      return response.products
        .map(p => p.handle)
        .filter((handle): handle is string => !!handle)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        console.error("Timeout fetching product handles (10s)")
      } else {
        throw fetchError
      }
      return []
    }
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

/**
 * Get a single variant by its ID with full details
 * Uses the GET /store/variants/:id endpoint
 */
export async function getVariantById(id: string): Promise<HttpTypes.StoreProductVariant | null> {
  console.log('[getVariantById] Fetching variant with ID:', id)
  
  const next = {
    ...(await getCacheOptions("products")),
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const response = await sdk.client.fetch<{ variant: HttpTypes.StoreProductVariant }>(
      `/store/variants/${id}`,
      {
        method: "GET",
        query: {
          fields: "*calculated_price,*original_price,+inventory_quantity",
        },
        headers,
        next,
        cache: "no-cache",
      }
    )

    console.log('[getVariantById] Successfully fetched variant:', response.variant.id)
    
    return response.variant
  } catch (error) {
    console.error(`Error fetching variant by ID: ${id}`, error)
    return null
  }
}

/**
 * Get all variants for a specific product by product ID
 * Returns all variants with their calculated prices and product info
 */
export async function getVariantsByProductId(productId: string): Promise<HttpTypes.StoreProductVariant[]> {
  console.log('[getVariantsByProductId] Fetching variants for product:', productId)
  
  const next = {
    ...(await getCacheOptions("products")),
  }

  const region = await getRegion(DEFAULT_COUNTRY_CODE)
  
  if (!region) {
    console.error(`Region not found for country code: ${DEFAULT_COUNTRY_CODE}`)
    return []
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    // Fetch the product with all its variants
    const response = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          id: productId,
          region_id: region.id,
          fields: "*variants,*variants.calculated_price,*variants.original_price,+variants.inventory_quantity,*variants.options,*variants.options.option",
        },
        headers,
        next,
        cache: "no-cache",
      }
    )

    if (!response.products || response.products.length === 0) {
      console.log('[getVariantsByProductId] Product not found:', productId)
      return []
    }

    const product = response.products[0]
    const variants = product.variants || []
    
    console.log(`[getVariantsByProductId] Found ${variants.length} variants for product:`, product.title)
    
    return variants
  } catch (error) {
    console.error(`Error fetching variants for product ${productId}:`, error)
    return []
  }
}

/**
 * Get a single product by its ID (not handle)
 * Uses GET /store/products/:id endpoint
 * Returns product with ALL variants and their calculated prices
 */
export async function getProductById(productId: string): Promise<HttpTypes.StoreProduct | null> {
  console.log('[getProductById] Fetching product with ID:', productId)
  
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
    // Use the /store/products/:id endpoint (not query parameter)
    const response = await sdk.client.fetch<{ product: HttpTypes.StoreProduct }>(
      `/store/products/${productId}`,
      {
        method: "GET",
        query: {
          region_id: region.id,
          fields: "*variants,*variants.calculated_price,*variants.original_price,+variants.inventory_quantity,*variants.options,*variants.options.option,*images,*collection,+metadata,+tags",
        },
        headers,
        next,
        cache: "no-cache",
      }
    )

    console.log('[getProductById] Successfully fetched product:', response.product.title)
    console.log(`[getProductById] Product has ${response.product.variants?.length || 0} variants`)
    
    return response.product
  } catch (error) {
    console.error(`Error fetching product by ID ${productId}:`, error)
    return null
  }
}

export async function getVariantsAsStandaloneProducts({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
}> {
  // 1. Fetch products with variants and prices DIRECTLY to verify data without cache
  const limit = queryParams?.limit || 12
  const offset = 0
  
  const headers = {
    ...(await getAuthHeaders()),
  }

  // Use the exact field logic that works in getProductByHandle
  const { products, count } = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
    `/store/products`,
    {
      method: "GET",
      query: {
        limit,
        offset,
        region_id: regionId,
        // Using the comprehensive fields list from getProductByHandle
        fields: "*variants,*variants.calculated_price,*variants.original_price,+variants.inventory_quantity,*variants.images,+variants.metadata,+variants.thumbnail,*images,*thumbnail,+title,+handle,+description,+metadata,+tags",
        ...queryParams,
      },
      headers,
      cache: "no-cache", // FORCE NO CACHE to see fresh data
    }
  )

  const standaloneProducts: HttpTypes.StoreProduct[] = []

  // 2. Transform: Flatten variants into products
  for (const product of products) {
    if (!product.variants || product.variants.length === 0) continue

    for (const variant of product.variants) {
      // Logic to determine the image for this variant
      // User requested to "ignore defaults", so we start with null instead of product.thumbnail
      let variantImage: string | null = null 
      
      const variantMetadata = (variant as any).metadata || {}
      
      console.log(`[Variant Transform] Product: ${product.title}, Variant: ${variant.title}`)
      console.log(`[Variant Transform] Variant Thumbnail:`, (variant as any).thumbnail)
      console.log(`[Variant Transform] Variant Images Len:`, (variant as any).images?.length)
      
      // DEBUG: Log the first image object if exists
      if ((variant as any).images?.length > 0) {
        console.log(`[Variant Transform] First Image Object:`, JSON.stringify((variant as any).images[0]))
      }

      // Priority 1: Direct variant images (Standard Medusa relation)
      if ((variant as any).images && (variant as any).images.length > 0) {
        console.log(`[Variant Transform] Using variant.images[0]`)
        variantImage = (variant as any).images[0].url
      }
      // Priority 2: Direct variant thumbnail
      else if ((variant as any).thumbnail) {
        console.log(`[Variant Transform] Using variant.thumbnail`)
        variantImage = (variant as any).thumbnail
      }
      // Priority 3: Metadata image_ids
      else if (variantMetadata.image_ids && Array.isArray(variantMetadata.image_ids) && variantMetadata.image_ids.length > 0) {
         console.log(`[Variant Transform] Found image_ids:`, variantMetadata.image_ids)
         const foundImage = product.images?.find((img: any) => variantMetadata.image_ids.includes(img.id))
         if (foundImage) {
           console.log(`[Variant Transform] Found matching image URL: ${foundImage.url}`)
           variantImage = foundImage.url
         } else {
           console.log(`[Variant Transform] No matching image found in product.images for these IDs`)
         }
      }
      // Fallback to image_url in metadata
      else if (variantMetadata.image_url) {
        console.log(`[Variant Transform] Using image_url from metadata`)
        variantImage = variantMetadata.image_url
      } else {
        console.log(`[Variant Transform] No specific image found`)
      }
      
      // Create a "virtual" product for this variant
      const virtualProduct: any = {
        ...product,
        // Create a unique ID for the key (optional, but good for React keys if used directly)
        id: `${product.id}_${variant.id}`, 
        // We might want to append variant title, but ProductCard usually just shows product.title.
        // If we want to show "Shirt - Red", we can append it here.
        // For now, let's keep the main title but maybe the variants array only has THIS variant.
        title: product.title, 
        thumbnail: variantImage,
        // CRITICAL: Only include THIS variant so ProductCard logic (min price, etc.) works on this specific item
        variants: [variant],
        // Preserve original handle for linking, but ProductCard logic might need tweaking if we want unique URLs?
        // ProductCard uses: /product/{handle}?variant={variant.id}
        // If we pass the parent handle and this single variant, ProductCard will generate the correct deep link.
        handle: product.handle
      }
      
      standaloneProducts.push(virtualProduct)
    }
  }

  return {
    response: {
      products: standaloneProducts,
      count: count // Note: Count is still based on PARENT products for pagination purposes
    },
    nextPage:  null
  }
}

/**
 * Search products by query string
 * Uses the q parameter for partial matching on title, handle, etc.
 */

/**
 * Search products by query string
 * Uses the q parameter for partial matching on title, handle, etc.
 * THEN strictly filters by title/handle to remove irrelevant matches (e.g. description matches)
 * AND transforms matching variants into standalone products for display
 */
export async function getProductsBySearch(
  query: string,
  limit: number = 100
): Promise<HttpTypes.StoreProduct[]> {
  const next = {
    ...(await getCacheOptions("products")),
  }

  const region = await getRegion(DEFAULT_COUNTRY_CODE)

  if (!region) {
    return []
  }

  const normalizedQuery = query.toLowerCase().trim()

  try {
    // 1. Fetch broad candidates using Medusa's fuzzy search
    const productsResponse = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          q: query,
          region_id: region.id,
          fields: "*variants,*variants.calculated_price,*variants.original_price,+variants.inventory_quantity,*variants.images,+variants.metadata,+variants.thumbnail,*images,*thumbnail,+title,+handle,+description,+metadata,+tags",
          limit,
        },
        next,
        cache: "force-cache",
      }
    )

    const products = productsResponse.products
    const standaloneProducts: HttpTypes.StoreProduct[] = []

    // 2. Transform: Flatten variants into products (Logic from getVariantsAsStandaloneProducts)
    for (const product of products) {
      if (!product.variants || product.variants.length === 0) continue

      for (const variant of product.variants) {
        // STRICT FILTERING: Check if the Product Title, Handle, or Variant Title contains the query
        // We only want to show this variant if it matches the name/handle explicitly.
        // This avoids showing "Steam Engine" when searching for "Ruthless" just because "Ruthless" is in the description.
        
        const productTitleMatch = product.title?.toLowerCase().includes(normalizedQuery)
        const productHandleMatch = product.handle?.toLowerCase().includes(normalizedQuery)
        const variantTitleMatch = variant.title?.toLowerCase().includes(normalizedQuery)
        
        // If NONE of them match, skip this variant
        if (!productTitleMatch && !productHandleMatch && !variantTitleMatch) {
            continue
        }

        // Logic to determine the image for this variant
        let variantImage: string | null = null 
        
        const variantMetadata = (variant as any).metadata || {}

        // Priority 1: Direct variant images (Standard Medusa relation)
        if ((variant as any).images && (variant as any).images.length > 0) {
          variantImage = (variant as any).images[0].url
        }
        // Priority 2: Direct variant thumbnail
        else if ((variant as any).thumbnail) {
          variantImage = (variant as any).thumbnail
        }
        // Priority 3: Metadata image_ids
        else if (variantMetadata.image_ids && Array.isArray(variantMetadata.image_ids) && variantMetadata.image_ids.length > 0) {
           const foundImage = product.images?.find((img: any) => variantMetadata.image_ids.includes(img.id))
           if (foundImage) {
             variantImage = foundImage.url
           }
        }
        // Fallback to image_url in metadata
        else if (variantMetadata.image_url) {
          variantImage = variantMetadata.image_url
        }
        
        // Create a "virtual" product for this variant
        const virtualProduct: any = {
          ...product,
          id: `${product.id}_${variant.id}`, // Unique ID for React keys
          title: product.title, // Keep main title, ProductCard can handle variant info if needed
          thumbnail: variantImage,
          variants: [variant], // Only include THIS variant
          handle: product.handle
        }
        
        standaloneProducts.push(virtualProduct)
      }
    }

    return standaloneProducts
  } catch (error) {
    console.error(`Error fetching products by search query: ${query}`, error)
    return []
  }
}


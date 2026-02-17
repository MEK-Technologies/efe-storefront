"use server"

import { COOKIE_FAVORITES } from "constants/index"
import { cookies } from "next/headers"

export type StoredFavorite = { variantHandle: string; variantId?: string }

export async function toggleFavoriteProduct(prevState: any, variantHandle: string, variantId?: string) {
  const favorites = await getParsedFavoritesHandles()

  const existsIndex = favorites.findIndex((f) => f.variantHandle === variantHandle && (variantId ? f.variantId === variantId : true))
  const isFavorite = existsIndex !== -1

  let newFavorites: StoredFavorite[]

  if (isFavorite) {
    // remove the matching favorite (if variantId provided, require exact match, otherwise remove any with same handle)
    newFavorites = favorites.filter((f) => !(f.variantHandle === variantHandle && (variantId ? f.variantId === variantId : true)))
  } else {
    newFavorites = [...favorites, { variantHandle, variantId }]
  }

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_FAVORITES, JSON.stringify(newFavorites))

  return !isFavorite
}

export async function getParsedFavoritesHandles(): Promise<StoredFavorite[]> {
  const favoritesCookie = (await cookies()).get(COOKIE_FAVORITES)?.value || "[]"
  let parsed: unknown = []

  try {
    parsed = JSON.parse(favoritesCookie)
  } catch (e) {
    parsed = []
  }

  // Backwards compatibility: if stored as array of strings, convert to objects
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return []
    if (typeof parsed[0] === "string") {
      return (parsed as string[]).map((s) => ({ variantHandle: s }))
    }
    // assume already in object shape
    return (parsed as StoredFavorite[]).map((f) => ({ variantHandle: (f as any).variantHandle ?? "", variantId: (f as any).variantId }))
  }

  return []
}

// Return unique variant IDs stored in favorites cookie
export async function getFavoriteVariantIds(): Promise<string[]> {
  const favoritesCookie = (await cookies()).get(COOKIE_FAVORITES)?.value || "[]"

  let parsed: unknown = []
  try {
    parsed = JSON.parse(favoritesCookie)
  } catch (e) {
    parsed = []
  }

  if (!Array.isArray(parsed) || parsed.length === 0) return []

  const ids: string[] = []

  for (const item of parsed as any[]) {
    if (!item) continue

    // item can be a string (old shape) or an object
    if (typeof item === "string") continue

    // possible places for variant id
    const candidate =
      item.variantId ?? item.variant_id ?? item.id ?? (item.variant && item.variant.id) ?? null

    if (candidate && typeof candidate === "string") ids.push(candidate)
  }

  return Array.from(new Set(ids))
}

// Build full product + variant data for favorites view
export async function getFavoritesVariantData() {
  const favorites = await getParsedFavoritesHandles()

  // We only need the product fetcher now
  const { getProductByHandle } = await import("lib/medusa/data/product-queries")
  const { getFeaturedImage } = await import("utils/medusa-product-helpers")

  // Helper patterns from original code to extract base handle
  const {
    getMultiOptionFromSlug,
    // runVisualOptionFromSlug removed
    removeMultiOptionFromSlug,
    removeVisualOptionFromSlug,
    getVisualOptionFromSlug,
  } = await import("utils/visual-variant-utils")
  const { removeOptionsFromUrl } = await import("utils/product-options-utils")

  const variantData: Array<any> = []

  for (const fav of favorites) {
    const variantHandle = fav.variantHandle
    const variantId = fav.variantId

    // Debug: show which favorite is being processed
    try {
      console.log("Processing favorite from cookie:", { variantHandle, variantId })
    } catch (e) {
      /* ignore */
    }

    let baseHandle: string = ""
    
    // Logic to extract base handle (same as before)
    try {
      if (variantHandle.includes("--")) {
        baseHandle = removeMultiOptionFromSlug(variantHandle)
      } else if (variantHandle.includes("-color_")) {
        baseHandle = removeVisualOptionFromSlug(variantHandle)
      } else {
        baseHandle = removeOptionsFromUrl(variantHandle)
      }

      // 1. Fetch Key Product Data
      const product = await getProductByHandle(baseHandle)
      if (!product) continue

      const variants = product.variants ?? []
      let selectedVariant: any | undefined

      // 2. Resolve the specific variant
      // Priority A: explicit variantId (most reliable)
      if (variantId) {
        selectedVariant = variants.find((v: any) => v.id === variantId)
      }

      // Priority B: derive from handle logic (legacy fallback)
      if (!selectedVariant) {
        // Try to reconstruct logic if needed, or just pick first if we can't match
        // Ideally we should always have variantId now, but for old cookies:
        if (variantHandle.includes("--")) {
             const multiOptions = getMultiOptionFromSlug(variantHandle)
             const { getCombinationByMultiOption } = await import("utils/visual-variant-utils")
             selectedVariant = getCombinationByMultiOption(variants, multiOptions)
        } else if (variantHandle.includes("-color_")) {
             const visualValue = getVisualOptionFromSlug(variantHandle)
             const { getCombinationByVisualOption } = await import("utils/visual-variant-utils")
             selectedVariant = getCombinationByVisualOption(variants, visualValue)
        }
      }
      
      // Fallback: if we still don't have a variant but have a product, maybe default to first?
      // Or skip? For favorites, usually implies a specific choice.
      if (!selectedVariant && variants.length > 0) {
         selectedVariant = variants[0]
      }

      // 3. Determine Image for the selected variant
      // Logic copied/adapted from product-queries.ts -> getProductsBySearch
      let featuredImage: { url: string; alt: string } | null = null
      
      if (selectedVariant) {
         const variant = selectedVariant as any
         const variantMetadata = variant.metadata || {}
         let imageUrl: string | null = null

         // Priority 1: Direct variant images
         if (variant.images && variant.images.length > 0) {
             imageUrl = variant.images[0].url
         }
         // Priority 2: Direct variant thumbnail
         else if (variant.thumbnail) {
             imageUrl = variant.thumbnail
         }
         // Priority 3: Metadata image_ids
         else if (variantMetadata.image_ids && Array.isArray(variantMetadata.image_ids) && variantMetadata.image_ids.length > 0) {
             const foundImage = product.images?.find((img: any) => variantMetadata.image_ids.includes(img.id))
             if (foundImage) {
                 imageUrl = foundImage.url
             }
         }
         // Priority 4: Metadata image_url
         else if (variantMetadata.image_url) {
             imageUrl = variantMetadata.image_url
         }
         
         if (imageUrl) {
             featuredImage = { url: imageUrl, alt: product.title || "" }
         }
      }

      // Fallback if no specific variant image found, use product featured image
      if (!featuredImage) {
          featuredImage = getFeaturedImage(product)
      }

      // 4. Extract Variant Info (Options)
      let variantInfo: Array<{ name: string; value: string }> = []
      if (selectedVariant?.options) {
        variantInfo = selectedVariant.options.map((opt: any) => ({
          name: opt.option?.title ?? "",
          value: opt.value ?? "",
        })).filter((info: any) => info.name && info.value)
      }

      variantData.push({
        product,
        variantHandle,
        variant: selectedVariant,
        featuredImage,
        variantInfo,
      })

    } catch (error) {
      console.error("Error processing favorite item:", error)
      // skip on error
    }
  }

  return variantData
}

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

  const { getProductByHandle } = await import("lib/medusa/data/product-queries")
  const {
    filterImagesByVisualOption,
    getCombinationByMultiOption,
    getCombinationByVisualOption,
    getMultiOptionFromSlug,
    getVisualOptionFromSlug,
    removeMultiOptionFromSlug,
    removeVisualOptionFromSlug,
  } = await import("utils/visual-variant-utils")
  const { removeOptionsFromUrl } = await import("utils/product-options-utils")
  const { getFeaturedImage } = await import("utils/medusa-product-helpers")

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
    let multiOptions: Record<string, string> = {}
    let visualValue: string | null = null
    let product: any | null = null

      try {
      // Always extract base handle from variantHandle
      if (variantHandle.includes("--")) {
        multiOptions = getMultiOptionFromSlug(variantHandle)
        baseHandle = removeMultiOptionFromSlug(variantHandle)
      } else if (variantHandle.includes("-color_")) {
        visualValue = getVisualOptionFromSlug(variantHandle)
        baseHandle = removeVisualOptionFromSlug(variantHandle)
      } else {
        baseHandle = removeOptionsFromUrl(variantHandle)
      }

      // Use Medusa SDK to fetch product by handle (same pattern as product pages)
      product = await getProductByHandle(baseHandle)
      try {
        console.log("getProductByHandle result", { baseHandle, variantId, found: !!product })
      } catch (e) {}

      if (!product) continue

      let combination: any | undefined
      let variantInfo: Array<{ name: string; value: string }> = []
      const variants = product.variants ?? []

      if (variantId) {
        combination = variants.find((v: any) => v.id === variantId)
      }

      if (!combination) {
        if (Object.keys(multiOptions).length > 0) {
          combination = getCombinationByMultiOption(variants, multiOptions)
        } else if (visualValue) {
          combination = getCombinationByVisualOption(variants, visualValue)
        } else {
          combination = variants[0]
        }
      }

      if (combination) {
        const variant = variants.find((v: any) => v.id === combination!.id)
        if (variant?.options) {
          variantInfo = variant.options.map((opt: any) => ({
            name: opt.option?.title ?? "",
            value: opt.value ?? "",
          })).filter((info: any) => info.name && info.value)
        }
      }

      let featuredImage = getFeaturedImage(product)

      if (combination) {
        const variant = variants.find((v: any) => v.id === combination!.id)

        if (variant?.options) {
          const visualOptions = ["Color", "Colour", "color", "colour"]
          let filteredImages = product.images ?? []

          for (const optionName of visualOptions) {
            const option = variant.options.find((opt: any) => opt.option?.title?.toLowerCase() === optionName.toLowerCase())
            if (option?.value) {
              const variantImages = filterImagesByVisualOption(product.images ?? [], option.value, option.option?.title ?? "Color")
              if (variantImages.length > 0 && variantImages !== product.images) {
                filteredImages = variantImages
                break
              }
            }
          }

          if (filteredImages.length > 0) {
            const first = filteredImages[0]
            featuredImage = first?.url ? { url: first.url, alt: product.title ?? "" } : featuredImage
          }
        }
      }

      variantData.push({
        product,
        variantHandle,
        variant: combination,
        featuredImage,
        variantInfo,
      })
    } catch (error) {
      // skip on error
    }
  }

  return variantData
}

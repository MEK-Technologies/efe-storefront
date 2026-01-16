import { HttpTypes } from "@medusajs/types"

export const DEFAULT_VISUAL_OPTION = "Color"

export function getVisualOptionName(override?: string): string {
  return override || DEFAULT_VISUAL_OPTION
}

export function removeVisualOptionFromSlug(slug: string, optionName = DEFAULT_VISUAL_OPTION): string {
  const pattern = new RegExp(`-${optionName.toLowerCase()}_[^_]+`, "i")
  return slug.replace(pattern, "")
}

export function getVisualOptionFromSlug(slug: string, optionName = DEFAULT_VISUAL_OPTION): string | null {
  const pattern = new RegExp(`-${optionName.toLowerCase()}_([^_]+)`, "i")
  const m = slug.match(pattern)
  return m ? decodeURIComponent(m[1]).toLowerCase() : null
}

export function createVisualOptionSlug(baseSlug: string, value?: string, optionName = DEFAULT_VISUAL_OPTION): string {
  const clean = removeVisualOptionFromSlug(baseSlug, optionName)
  return value ? `${clean}-${optionName.toLowerCase()}_${encodeURIComponent(value)}` : clean
}

function slugifyOptionName(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "")
}

function slugifyOptionValue(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "")
}

export function removeMultiOptionFromSlug(slug: string): string {
  const doubleDashIndex = slug.indexOf("--")
  return doubleDashIndex !== -1 ? slug.substring(0, doubleDashIndex) : slug
}

export function getMultiOptionFromSlug(slug: string): Record<string, string> {
  const options: Record<string, string> = {}

  const parts = slug.split("--")
  if (parts.length < 2) return options

  const optionsString = parts[1]

  const pattern = /([a-z0-9]+)_([a-z0-9]+)/g
  let match

  while ((match = pattern.exec(optionsString)) !== null) {
    const optionName = match[1]
    const optionValue = match[2]
    options[optionName] = optionValue
  }

  return options
}

export function createMultiOptionSlug(baseSlug: string, options: Record<string, string>): string {
  const clean = removeMultiOptionFromSlug(baseSlug)
  const optionParts = Object.entries(options)
    .filter(([_, value]) => value)
    .map(([key, value]) => `${slugifyOptionName(key)}_${slugifyOptionValue(value)}`)
    .sort()
    .join("-")

  return optionParts ? `${clean}--${optionParts}` : clean
}

/**
 * Helper to extract option name and value from a Medusa variant option
 */
function getMedusaOptionNameValue(opt: NonNullable<HttpTypes.StoreProductVariant["options"]>[0]): { name: string; value: string } | null {
  const name = opt.option?.title
  const value = opt.value
  if (!name || !value) return null
  return { name, value }
}

/**
 * Get option value from a combination/variant for a given option name.
 * Works with both Combination objects and Medusa StoreProductVariant.
 */
export function getVisualOptionValueFromCombination(
  combination: any,
  optionName = DEFAULT_VISUAL_OPTION
): string | undefined {
  if (!combination) return undefined

  // Check if it's a flat Combination object with the option as a property
  if (optionName.toLowerCase() === "color" && combination?.color) {
    return combination.color
  }

  const lowerOptionName = optionName.toLowerCase()
  if (combination?.[lowerOptionName]) {
    return combination[lowerOptionName]
  }

  // Check Medusa's options structure
  if (combination?.options && Array.isArray(combination.options)) {
    for (const opt of combination.options) {
      const parsed = getMedusaOptionNameValue(opt)
      if (parsed && parsed.name.toLowerCase() === lowerOptionName) {
        return parsed.value
      }
    }
  }

  return undefined
}

/**
 * Get all option values from a combination/variant as a flat object.
 */
export function getAllOptionValuesFromCombination(combination: any): Record<string, string> {
  const options: Record<string, string> = {}

  // Check Medusa's options structure
  if (combination?.options && Array.isArray(combination.options)) {
    for (const opt of combination.options) {
      const parsed = getMedusaOptionNameValue(opt)
      if (parsed) {
        options[parsed.name.toLowerCase()] = parsed.value.toLowerCase()
      }
    }
    return options
  }

  // Fallback: treat combination as flat object with option values
  if (combination && typeof combination === "object") {
    const excludedKeys = ["id", "availableForSale", "price", "title", "quantityAvailable", "options", 
      "calculated_price", "manage_inventory", "inventory_quantity", "sku", "barcode", "ean", "upc",
      "variant_rank", "created_at", "updated_at", "deleted_at", "product_id", "product", "allow_backorder"]
    Object.keys(combination).forEach((key) => {
      if (!excludedKeys.includes(key) && combination[key] && typeof combination[key] !== "object") {
        options[key.toLowerCase()] = combination[key].toString().toLowerCase()
      }
    })
  }

  return options
}

/**
 * Get original option value from variants given slugified option name/value.
 * Works with Medusa variant options structure.
 */
export function getOriginalOptionValue(
  variants: HttpTypes.StoreProductVariant[] | null | undefined,
  slugifiedOptionName: string,
  slugifiedOptionValue: string
): string | null {
  if (!variants) return null

  for (const variant of variants) {
    if (!variant.options) continue

    for (const opt of variant.options) {
      const parsed = getMedusaOptionNameValue(opt)
      if (!parsed) continue

      const optionNameSlug = slugifyOptionName(parsed.name)
      const optionValueSlug = slugifyOptionValue(parsed.value)

      if (optionNameSlug === slugifiedOptionName && optionValueSlug === slugifiedOptionValue) {
        return parsed.value
      }
    }
  }

  return null
}

export function filterImagesByVisualOption<T extends { url: string }>(
  images: T[],
  value: string | null,
  optionName = DEFAULT_VISUAL_OPTION
): T[] {
  if (!value) return images
  const needle = `-${optionName}-`.toLowerCase() + value.toLowerCase()
  const matches = images.filter((img) => img.url.toLowerCase().includes(needle))
  return matches.length > 0 ? matches : images
}

export function getImagesForCarousel<T extends { url: string }>(
  images: T[] | null | undefined,
  value: string | null,
  optionName = DEFAULT_VISUAL_OPTION
): { images: T[]; activeIndex: number } {
  if (!images || images.length === 0) {
    return { images: [] as T[], activeIndex: 0 }
  }

  if (!value || images.length <= 1) {
    return { images, activeIndex: 0 }
  }

  const needle = `-${optionName}-`.toLowerCase() + value.toLowerCase()
  const matchingImages = images.filter((img) => img.url.toLowerCase().includes(needle))

  if (matchingImages.length > 0) {
    const activeIndex = images.findIndex((img) => matchingImages.includes(img))
    return { images, activeIndex: Math.max(0, activeIndex) }
  }

  return { images, activeIndex: 0 }
}

/**
 * Find a variant by visual option value (e.g., color).
 * Works with Medusa's options structure.
 */
export function getCombinationByVisualOption(
  variants: HttpTypes.StoreProductVariant[] | null | undefined,
  visualValue: string | null,
  optionName = DEFAULT_VISUAL_OPTION
): HttpTypes.StoreProductVariant | undefined {
  if (!variants || variants.length === 0) return undefined
  if (!visualValue || variants.length <= 1) {
    return variants.find(Boolean)
  }

  return variants.find((variant) =>
    variant.options?.some((opt) => {
      const parsed = getMedusaOptionNameValue(opt)
      return (
        parsed &&
        parsed.name.toLowerCase() === optionName.toLowerCase() &&
        parsed.value.toLowerCase() === visualValue.toLowerCase()
      )
    })
  )
}

/**
 * Find a variant by multiple option slugs.
 * Works with Medusa's options structure.
 */
export function getCombinationByMultiOption(
  variants: HttpTypes.StoreProductVariant[] | null | undefined,
  slugOptions: Record<string, string>
): HttpTypes.StoreProductVariant | undefined {
  if (!variants || variants.length === 0) return undefined
  if (Object.keys(slugOptions).length === 0 || variants.length <= 1) {
    return variants.find(Boolean)
  }

  return variants.find((variant) => {
    if (!variant.options) return false

    return Object.entries(slugOptions).every(([slugOptionName, slugOptionValue]) => {
      return variant.options?.some((opt) => {
        const parsed = getMedusaOptionNameValue(opt)
        if (!parsed) return false
        const optionNameSlug = slugifyOptionName(parsed.name)
        const optionValueSlug = slugifyOptionValue(parsed.value)
        return optionNameSlug === slugOptionName && optionValueSlug === slugOptionValue
      })
    })
  })
}

/**
 * Check if a visual option value is valid for the given variants.
 */
export function hasValidVisualOption(
  variants: HttpTypes.StoreProductVariant[] | null | undefined,
  visualValue: string | null,
  optionName = DEFAULT_VISUAL_OPTION
): boolean {
  if (!visualValue) return true
  if (!variants || variants.length === 0) return false

  return variants.some((variant) =>
    variant.options?.some((opt) => {
      const parsed = getMedusaOptionNameValue(opt)
      return (
        parsed &&
        parsed.name.toLowerCase() === optionName.toLowerCase() &&
        parsed.value.toLowerCase() === visualValue.toLowerCase()
      )
    })
  )
}

/**
 * Check if multiple option slugs are valid for the given variants.
 */
export function hasValidMultiOption(
  variants: HttpTypes.StoreProductVariant[] | null | undefined,
  slugOptions: Record<string, string>
): boolean {
  if (Object.keys(slugOptions).length === 0) return true
  if (!variants || variants.length === 0) return false

  return variants.some((variant) => {
    if (!variant.options) return false

    return Object.entries(slugOptions).every(([slugOptionName, slugOptionValue]) => {
      return variant.options?.some((opt) => {
        const parsed = getMedusaOptionNameValue(opt)
        if (!parsed) return false
        const optionNameSlug = slugifyOptionName(parsed.name)
        const optionValueSlug = slugifyOptionValue(parsed.value)
        return optionNameSlug === slugOptionName && optionValueSlug === slugOptionValue
      })
    })
  })
}

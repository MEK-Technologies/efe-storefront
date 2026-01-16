import { HttpTypes } from "@medusajs/types"
import type { CommerceProduct } from "types"

export interface Combination {
  id: string
  availableForSale: boolean
  quantityAvailable?: number | null | undefined
  price: { amount: number; currencyCode: string } | undefined
  title: string
  color?: string
  [key: string]: string | boolean | number | null | undefined | { amount: number; currencyCode: string }
}

type Option = keyof Pick<Combination, "color">

/**
 * Get all variant combinations from Medusa product variants.
 * Maps Medusa variant options to a flat combination structure.
 */
export function getAllCombinations(variants: HttpTypes.StoreProductVariant[] | null | undefined): Combination[] {
  if (!variants) return []
  
  return variants.map((variant) => {
    // Extract price from calculated_price
    const price = variant.calculated_price?.calculated_amount != null
      ? {
          amount: variant.calculated_price.calculated_amount,
          currencyCode: variant.calculated_price.currency_code || "USD",
        }
      : undefined

    // Check availability based on inventory
    const availableForSale = variant.manage_inventory 
      ? (variant.inventory_quantity ?? 0) > 0 
      : true

    // Build the combination with options spread
    const combination: Combination = {
      id: variant.id,
      availableForSale,
      price,
      title: variant.title ?? "",
      quantityAvailable: variant.inventory_quantity,
    }

    // Add variant options as flat properties
    if (variant.options) {
      for (const option of variant.options) {
        if (option.option?.title && option.value) {
          combination[option.option.title.toLowerCase()] = decodeURIComponent(option.value.toLowerCase())
        }
      }
    }

    return combination
  })
}

export function getCombination(product: CommerceProduct, color: string | null) {
  const variants = product.variants
  const hasOnlyOneVariant = !variants || variants.length <= 1

  // Get default color from product options
  const colorOption = product.options?.find(opt => opt.title?.toLowerCase() === "color")
  const defaultColor = colorOption?.values?.[0]?.value?.toLowerCase()

  if (hasOnlyOneVariant) {
    return variants?.find(Boolean)
  }

  const combinations = getAllCombinations(variants)
  return combinations.find((combination) => combination.color === (color ?? defaultColor))
}

export function hasValidOption(
  variants: HttpTypes.StoreProductVariant[] | null | undefined,
  optionName: Option,
  optionValue: string | null
): boolean {
  const combinations = getAllCombinations(variants || [])
    .flatMap((combination) => combination?.[optionName])
    .filter((val): val is string => typeof val === "string")

  return !optionValue || combinations.includes(optionValue)
}

export function createOptionfulUrl(originalUrl: string, color: string | null | undefined) {
  const urlWithoutParams = removeOptionsFromUrl(originalUrl)

  const newColorParam = color ? `-color_${color}` : ""

  return `${urlWithoutParams}${newColorParam}`
}

export function removeOptionsFromUrl(pathname: string) {
  const colorPattern = /-color_([0-9a-zA-Z\s]+)/i

  return decodeURIComponent(pathname).replace(colorPattern, "")
}

export function getOptionsFromUrl(pathname: string) {
  const result: Record<Option, null | string> = {
    color: null,
  }

  const colorPattern = /-color_([0-9a-zA-Z\s]+)/

  const decodedPathname = decodeURIComponent(pathname)

  const colorMatch = decodedPathname.match(colorPattern)

  if (colorMatch) result.color = colorMatch[1].toLowerCase()

  return result
}

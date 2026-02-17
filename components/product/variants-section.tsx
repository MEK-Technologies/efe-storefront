"use client"

import { HttpTypes } from "@medusajs/types"
import { cn } from "utils/cn"
import { Combination, getAllCombinations } from "utils/product-options-utils"
import { createMultiOptionSlug } from "utils/visual-variant-utils"
import { Variant } from "./variant"
import { useCartStore } from "stores/cart-store"

interface VariantsSectionProps {
  variants: HttpTypes.StoreProductVariant[] | null | undefined
  className?: string
  combination: Combination | undefined
  handle: string
}

export function VariantsSection({ variants, className, handle, combination }: VariantsSectionProps) {
  const combinations = getAllCombinations(variants)
  const cart = useCartStore((s) => s.cart)

  if (!variants || variants.length === 0) {
    return null
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <p className="text-center text-sm text-neutral-500 md:text-left">Seleccionar variante</p>
      <div className="relative flex w-full flex-wrap justify-center gap-2 md:justify-start">
        {combinations.map((singleCombination) => {
          const cartItem = cart?.items?.find((item) => item.variant_id === singleCombination?.id)

          const variant = variants.find((v) => v.id === singleCombination.id)

          // Build options for URL from variant options
          const optionsForUrl: Record<string, string> = {}
          if (variant?.options) {
            variant.options.forEach((option) => {
              if (option.option?.title && option.value) {
                optionsForUrl[option.option.title] = option.value
              }
            })
          }

          return (
            <Variant
              cartItem={cartItem}
              key={singleCombination.id}
              href={createMultiOptionSlug(handle, optionsForUrl)}
              singleCombination={singleCombination}
              isActive={singleCombination.id === combination?.id}
            />
          )
        })}
      </div>
    </div>
  )
}

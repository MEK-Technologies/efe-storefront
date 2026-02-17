import Image from "next/image"
import Link from "next/link"
import { cn } from "utils/cn"
import { type CurrencyType, mapCurrencyToSign } from "utils/map-currency-to-sign"
import type { CommerceProduct } from "types"
import { ProductPrice } from "./product/product-price"
import type { VariantWithPricing } from "types/medusa-extensions"

import { HttpTypes } from "@medusajs/types"

interface ProductCardProps {
  product: CommerceProduct
  priority?: boolean
  prefetch?: boolean
  className?: string
  href?: string
  highlighted?: boolean
  variant?: "default" | "hero"
  hasCustomerGroupPricing?: boolean
  activeVariant?: HttpTypes.StoreProductVariant
}

/**
 * Get the featured image from product - uses thumbnail or first image
 */
function getFeaturedImage(product: CommerceProduct): { url: string; alt: string } | null {
  if (product.thumbnail) {
    return { url: product.thumbnail, alt: product.title }
  }
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0]
    return { url: firstImage.url, alt: product.title }
  }
  return null
}

/**
 * Get the minimum price variant from product variants.
 * Used to display the lowest price with full pricing metadata.
 * Handles both calculated prices and override price lists.
 */
function getMinPriceVariant(
  variants: HttpTypes.StoreProductVariant[] | null
): VariantWithPricing | null {
  if (!variants || variants.length === 0) return null

  // Try to find variants with calculated_price first
  const variantsWithCalculatedPrice = variants.filter(
    (v) => v.calculated_price?.calculated_amount != null
  )

  if (variantsWithCalculatedPrice.length > 0) {
    return variantsWithCalculatedPrice.reduce((min, current) =>
      current.calculated_price!.calculated_amount! < min.calculated_price!.calculated_amount!
        ? current
        : min
    ) as VariantWithPricing
  }

  // Fallback: find variants with original_price (for override price lists)
  const variantsWithOriginalPrice = variants.filter(
    (v) => (v as any).original_price?.amount != null
  )

  if (variantsWithOriginalPrice.length > 0) {
    return variantsWithOriginalPrice.reduce((min, current) => {
      const minPrice = (min as any).original_price?.amount || Infinity
      const currentPrice = (current as any).original_price?.amount || Infinity
      return currentPrice < minPrice ? current : min
    }) as VariantWithPricing
  }

  // Last resort: return first variant
  return variants[0] as VariantWithPricing
}

export const ProductCard = ({
  product,
  className,
  priority,
  prefetch = false,
  href = "",
  highlighted = false,
  variant = "default",
  hasCustomerGroupPricing = false,
  activeVariant,
}: ProductCardProps) => {
  const { handle, title, variants } = product
  const featuredImage = getFeaturedImage(product)
  const minPriceVariant = getMinPriceVariant(variants)
  const noOfVariants = variants?.length ?? 0
  
  // Logic to determine if we should show "From" / "Desde"
  // 1. If activeVariant is provided, NEVER show "From" (we show that specific variant's price)
  // 2. If all variants have the same price, NEVER show "From"
  // 3. Otherwise (multiple variants with diff prices), show "From"
  
  // Calculate if we have a price range
  const priceValues = variants?.map(v => {
    // Try calculated price first, then original price
    if (v.calculated_price?.calculated_amount != null) return v.calculated_price.calculated_amount
    if ((v as any).original_price?.amount != null) return (v as any).original_price.amount
    return null
  }).filter(p => p !== null) || []
  
  // Check if all valid prices are the same (using a small epsilon for float comparison if needed, but integers usually fine for cents)
  const allPricesAreSame = priceValues.length > 0 && priceValues.every(p => p === priceValues[0])
  
  // Valid price range exists if we have multiple prices AND they are not all the same
  const hasPriceRange = priceValues.length > 1 && !allPricesAreSame
  
  // Determine which variant to display price for
  // Priority: activeVariant > minPriceVariant > first variant
  const priceVariant = activeVariant || minPriceVariant || variants?.[0]
  
  // Show "From" label ONLY if we have a range AND no specific variant is active
  const showFromLabel = hasPriceRange && !activeVariant

  // Use the minimum price variant as the default variant to link to
  // If activeVariant is present, link to that specific variant
  const defaultVariant = activeVariant || minPriceVariant || variants?.[0]
  const path = href || (defaultVariant?.id ? `/product/${handle}?variant=${defaultVariant.id}` : `/product/${handle}`)
  
  // Logic to determine display title: prefer variant title unless it's "Default Variant"
  const displayTitle = (defaultVariant?.title && defaultVariant.title !== "Default Variant") 
    ? defaultVariant.title 
    : title

  const linkAria = `Visitar producto: ${displayTitle}`



  if (variant === "hero") {
    return (
      <Link
        className={cn(
          "group flex flex-col overflow-hidden rounded-lg border border-background/20 bg-background/95 p-3 shadow-xl backdrop-blur transition-all duration-300 hover:scale-105 hover:shadow-2xl",
          className
        )}
        aria-label={linkAria}
        href={path}
        prefetch={prefetch}
      >
        <div className="relative mb-3 aspect-square overflow-hidden rounded-md">
          <Image
            priority={priority}
            src={featuredImage?.url || "/default-product-image.svg"}
            alt={featuredImage?.alt || displayTitle}
            fill
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            sizes="240px"
          />
        </div>
        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground">{displayTitle}</h3>
        {priceVariant && (
          <ProductPrice
            variant={priceVariant}
            showBadge={true}
            displayVariant="compact"
            className="text-primary"
          />
        )}
        <span className="mt-2 text-xs font-medium text-muted-foreground">Comprar ahora →</span>
      </Link>
    )
  }

  return (
    <Link
      className={cn("group flex h-full w-full flex-col overflow-hidden rounded-lg bg-white shadow-sm border border-black/5", className)}
      aria-label={linkAria}
      href={path}
      prefetch={prefetch}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          priority={priority}
          src={featuredImage?.url || "/default-product-image.svg"}
          alt={featuredImage?.alt || displayTitle}
          fill
          className="object-contain p-2 transition-transform duration-300 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="bg-size-200 bg-pos-0 hover:bg-pos-100 flex min-h-[14rem] shrink-0 grow flex-col text-pretty bg-gradient-to-b from-transparent to-primary/5 p-4 transition-all duration-200">
        <h3
          className={cn(
            "line-clamp-2 min-h-[3.5rem] text-lg font-semibold transition-colors data-[featured]:text-2xl",
            highlighted && "md:text-2xl"
          )}
        >
          {displayTitle}
        </h3>
        <div className="flex flex-col pt-1">
          {/* Product type as subtitle if available */}
          {product.type?.value && (
            <p className={cn("text-sm text-gray-500", highlighted && "md:text-base")}>
              {product.type.value}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-1">

          </div>
        </div>

        {priceVariant && (
          <div className="mt-auto flex flex-col pt-4">
            {noOfVariants > 0 && (
              <p className={cn("text-sm text-gray-500", highlighted && "md:text-base")}>
                {noOfVariants} {noOfVariants > 1 ? "variantes" : "variante"}
              </p>
            )}
            <div className={cn("flex w-full flex-col gap-1", highlighted && "md:text-base")}>
              {showFromLabel && (
                <span className="text-sm text-primary/50">Desde</span>
              )}
              <ProductPrice
                variant={priceVariant}
                showBadge={true}
                displayVariant="compact"
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}

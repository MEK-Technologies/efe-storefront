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
}: ProductCardProps) => {
  const { handle, title, variants } = product
  const featuredImage = getFeaturedImage(product)
  const minPriceVariant = getMinPriceVariant(variants)
  const noOfVariants = variants?.length ?? 0
  const path = href || `/product/${handle}`
  const linkAria = `Visit product: ${title}`



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
            alt={featuredImage?.alt || title}
            fill
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            sizes="240px"
          />
        </div>
        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground">{title}</h3>
        {minPriceVariant && (
          <ProductPrice
            variant={minPriceVariant}
            showBadge={true}
            displayVariant="compact"
            className="text-primary"
          />
        )}
        <span className="mt-2 text-xs font-medium text-muted-foreground">Shop Now →</span>
      </Link>
    )
  }

  return (
    <Link
      className={cn("group flex h-full w-full flex-col overflow-hidden rounded-lg", className)}
      aria-label={linkAria}
      href={path}
      prefetch={prefetch}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          priority={priority}
          src={featuredImage?.url || "/default-product-image.svg"}
          alt={featuredImage?.alt || title}
          fill
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="bg-size-200 bg-pos-0 hover:bg-pos-100 flex shrink-0 grow flex-col text-pretty bg-gradient-to-b from-transparent to-primary/5 p-4 transition-all duration-200">
        <h3
          className={cn(
            "line-clamp-2 text-lg font-semibold transition-colors data-[featured]:text-2xl",
            highlighted && "md:text-2xl"
          )}
        >
          {title}
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

        {minPriceVariant && (
          <div className="mt-auto flex flex-col pt-10">
            {noOfVariants > 0 && (
              <p className={cn("text-sm text-gray-500", highlighted && "md:text-base")}>
                {noOfVariants} variant{noOfVariants > 1 ? "s" : ""}
              </p>
            )}
            <div className={cn("flex w-full flex-col gap-1", highlighted && "md:text-base")}>
              <span className="text-sm text-primary/50">From</span>
              <ProductPrice
                variant={minPriceVariant}
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

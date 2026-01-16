import Image from "next/image"
import Link from "next/link"
import { cn } from "utils/cn"
import { type CurrencyType, mapCurrencyToSign } from "utils/map-currency-to-sign"
import type { CommerceProduct } from "types"

import { HttpTypes } from "@medusajs/types"

interface ProductCardProps {
  product: CommerceProduct
  priority?: boolean
  prefetch?: boolean
  className?: string
  href?: string
  highlighted?: boolean
  variant?: "default" | "hero"
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
 * Get the minimum price from product variants using calculated_price
 */
function getMinPrice(variants: HttpTypes.StoreProductVariant[] | null): {
  amount: number
  currencyCode: string
} | null {
  if (!variants || variants.length === 0) return null

  const pricesWithValues = variants
    .filter((v) => v.calculated_price?.calculated_amount != null)
    .map((v) => ({
      amount: v.calculated_price!.calculated_amount!,
      currencyCode: v.calculated_price!.currency_code || "USD",
    }))

  if (pricesWithValues.length === 0) return null

  return pricesWithValues.reduce((min, current) =>
    current.amount < min.amount ? current : min
  )
}

/**
 * Format price with currency symbol
 */
function formatPrice(amount: number, currencyCode: string): string {
  const symbol = mapCurrencyToSign((currencyCode as CurrencyType) || "USD")
  // Medusa prices are in cents, divide by 100
  return `${symbol}${(amount).toFixed(0)}`
}

export const ProductCard = ({
  product,
  className,
  priority,
  prefetch = false,
  href = "",
  highlighted = false,
  variant = "default",
}: ProductCardProps) => {
  const { handle, title, variants } = product
  const featuredImage = getFeaturedImage(product)
  const minPriceData = getMinPrice(variants)
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
        {minPriceData && (
          <p className="text-sm font-medium text-primary">
            {formatPrice(minPriceData.amount, minPriceData.currencyCode)}
          </p>
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

        {minPriceData && (
          <div className="mt-auto flex flex-col pt-10">
            {noOfVariants > 0 && (
              <p className={cn("text-sm text-gray-500", highlighted && "md:text-base")}>
                {noOfVariants} variant{noOfVariants > 1 ? "s" : ""}
              </p>
            )}
            <div className={cn("flex w-full items-baseline justify-between text-sm", highlighted && "md:text-base")}>
              <span className="text-primary/50">From</span>
              <span className={cn("text-base font-semibold md:text-lg", highlighted && "md:text-2xl")}>
                {formatPrice(minPriceData.amount, minPriceData.currencyCode)}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}

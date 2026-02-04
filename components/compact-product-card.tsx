import Image from "next/image"
import Link from "next/link"
import { cn } from "utils/cn"
import { type CurrencyType, mapCurrencyToSign } from "utils/map-currency-to-sign"
import { createMultiOptionSlug } from "utils/visual-variant-utils"
import { HttpTypes } from "@medusajs/types"
import { getFeaturedImage, getVariantPrice } from "utils/medusa-product-helpers"
import { ProductPrice } from "./product/product-price"
import type { VariantWithPricing } from "types/medusa-extensions"

interface CompactProductCardProps {
  product: HttpTypes.StoreProduct
  className?: string
  priority?: boolean
  selectedVariant?: HttpTypes.StoreProductVariant
  variantOptions?: Record<string, string>
  loading?: "eager" | "lazy"
  hasCustomerGroupPricing?: boolean
}

export const CompactProductCard = ({
  product,
  className,
  priority = false,
  selectedVariant,
  variantOptions,
  loading: _loading = "lazy",
  hasCustomerGroupPricing = false,
}: CompactProductCardProps) => {
  const { handle, title, variants } = product
  const featuredImage = getFeaturedImage(product)
  
  // Use selected variant or first variant for pricing
  const displayVariant = (selectedVariant || variants?.[0]) as VariantWithPricing | undefined

  let href = `/product/${handle}`
  if (variantOptions && Object.keys(variantOptions).length > 0) {
    href = `/product/${createMultiOptionSlug(handle!, variantOptions)}`
  }

  return (
    <Link
      href={href}
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
        className
      )}
      aria-label={`View product: ${title}`}
    >
      <div className="relative aspect-square overflow-hidden bg-secondary/10">
        <Image
          src={featuredImage?.url || "/default-product-image.svg"}
          alt={featuredImage?.alt || title || "Product image"}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-foreground">{title}</h3>

        {displayVariant && (
          <div className="mt-auto">
            <span className="mb-1 block text-xs text-muted-foreground">From</span>
            <ProductPrice
              variant={displayVariant}
              showBadge={true}
              displayVariant="compact"
            />
          </div>
        )}
      </div>
    </Link>
  )
}

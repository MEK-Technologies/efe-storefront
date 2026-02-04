import Image from "next/image"
import Link from "next/link"
import { cn } from "utils/cn"
import { type CurrencyType, mapCurrencyToSign } from "utils/map-currency-to-sign"
import type { CommerceProduct } from "types"
import { ProductPrice } from "./product/product-price"
import type { VariantWithPricing } from "types/medusa-extensions"

import { getFeaturedImage } from "utils/medusa-product-helpers"

interface UniformProductCardProps {
  product: CommerceProduct
  priority?: boolean
  prefetch?: boolean
  className?: string
  featured?: boolean
  hasCustomerGroupPricing?: boolean
}

export const UniformProductCard = ({
  product,
  className,
  priority,
  prefetch = false,
  featured = false,
  hasCustomerGroupPricing = false,
}: UniformProductCardProps) => {
  const { handle, title, variants } = product
  const featuredImage = getFeaturedImage(product)
  const firstVariant = variants?.[0] as VariantWithPricing | undefined

  return (
    <Link
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background transition-all duration-300 hover:shadow-lg",
        className
      )}
      href={`/product/${handle}`}
      prefetch={prefetch}
    >
      {}
      <div className="relative aspect-square overflow-hidden bg-secondary/5">
        <Image
          priority={priority}
          src={featuredImage?.url || "/default-product-image.svg"}
          alt={featuredImage?.alt || title || "Product image"}
          fill
          className="object-contain transition-transform duration-300 ease-out group-hover:scale-105"
          sizes={featured ? "(max-width: 640px) 100vw, 350px" : "(max-width: 640px) 50vw, 250px"}
        />

        {featured && (
          <div className="absolute left-3 top-3 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
            Featured
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4">
        <h3 className={cn("mb-1 line-clamp-2 font-semibold", featured ? "text-lg" : "text-base")}>{title}</h3>

        {/* Product type as subtitle if available */}
        {product.type?.value && (
          <p className="mb-2 line-clamp-1 text-sm text-muted-foreground">{product.type.value}</p>
        )}

        {}


        {}
        <div className="mt-auto">
          {firstVariant && (
            <ProductPrice
              variant={firstVariant}
              showBadge={true}
              displayVariant="compact"
            />
          )}
          {variants && variants.length > 1 && (
            <p className="text-xs text-muted-foreground">{variants.length} variants</p>
          )}
        </div>
      </div>
    </Link>
  )
}

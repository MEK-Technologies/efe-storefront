import Image from "next/image"
import Link from "next/link"
import { cn } from "utils/cn"
import { type CurrencyType, mapCurrencyToSign } from "utils/map-currency-to-sign"
import type { CommerceProduct } from "types"
import { StarIcon } from "components/icons/star-icon"
import { getFeaturedImage, getMinPrice } from "utils/medusa-product-helpers"

interface FeaturedProductCardProps {
  product: CommerceProduct
  priority?: boolean
  prefetch?: boolean
  className?: string
}

export const FeaturedProductCard = ({
  product,
  className,
  priority,
  prefetch = false,
}: FeaturedProductCardProps) => {
  const { handle, title, variants, avgRating, totalReviews } = product
  const featuredImage = getFeaturedImage(product)
  const minPriceData = getMinPrice(variants)
  const noOfVariants = variants?.length ?? 0
  
  const href = `/product/${handle}`
  const linkAria = `Visit product: ${title}`

  return (
    <Link
      className={cn("group flex flex-col overflow-hidden rounded-lg border border-gray-100 transition-all", className)}
      aria-label={linkAria}
      href={href}
      prefetch={prefetch}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          priority={priority}
          className="object-cover transition-transform group-hover:scale-105"
          src={featuredImage?.url || "/default-product-image.svg"}
          alt={featuredImage?.alt || title || "Product image"}
          fill
        />
      </div>
      <div className="flex shrink-0 grow items-start  justify-between p-4 transition-colors group-hover:bg-gradient-to-t group-hover:from-gray-100 group-hover:to-transparent">
        <div className="flex flex-col gap-1">
          {}
          <h3 className="line-clamp-2 text-lg font-semibold">{title}</h3>
          {minPriceData && (
            <span className="block sm:hidden">
              From {mapCurrencyToSign((minPriceData.currencyCode as CurrencyType) || "USD") + minPriceData.amount.toFixed(2)}
            </span>
          )}

          <div className="mt-auto flex flex-col gap-1">
            {/* Product type as subtitle if available */}
            {product.type?.value && <p className="text-sm text-gray-500">{product.type.value}</p>}
            <div className="flex items-center gap-1">
              {!!avgRating && !!totalReviews && (
                <>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="size-4 fill-gray-400 stroke-gray-500" />
                    <span className="text-sm">{avgRating.toFixed(2)}</span>
                    <span className="text-xs">
                      ({totalReviews} review{totalReviews !== 1 && "s"})
                    </span>
                  </div>
                  •
                </>
              )}
              {noOfVariants > 0 && (
                <p className="text-sm text-gray-500">
                  {noOfVariants} variant{noOfVariants > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        </div>
        {minPriceData && (
          <span className="hidden sm:block">
            From {mapCurrencyToSign((minPriceData.currencyCode as CurrencyType) || "USD") + minPriceData.amount.toFixed(2)}
          </span>
        )}
      </div>
    </Link>
  )
}

import { Suspense } from "react"
import { Skeleton } from "components/ui/skeleton"
import { getFavoritesVariantData, getFavoriteVariantIds } from "app/actions/favorites.actions"
import Image from "next/image"
import Link from "next/link"
import { type CurrencyType, mapCurrencyToSign } from "utils/map-currency-to-sign"
import { StarIcon } from "components/icons/star-icon"
import { HttpTypes } from "@medusajs/types"
import { getVariantPrice } from "utils/medusa-product-helpers"
import type { CommerceProduct } from "types"

export const revalidate = 86400

export const dynamicParams = true

function FavoriteProductCard({
  product,
  variant,
  featuredImage,
  variantInfo,
  href,
  priority = false,
}: {
  product: CommerceProduct
  variant: HttpTypes.StoreProductVariant | undefined
  featuredImage: { url: string; alt: string } | null
  variantInfo: Array<{ name: string; value: string }>
  href: string
  priority?: boolean
}) {
  const linkAria = `Visit product: ${product.title}`
  const variantPrice = getVariantPrice(variant)

  return (
    <Link
      className="group flex size-full flex-col overflow-hidden rounded-lg"
      aria-label={linkAria}
      href={href}
      prefetch={false}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          priority={priority}
          src={featuredImage?.url || "/default-product-image.svg"}
          alt={product.title || "Product image"}
          fill
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="bg-size-200 bg-pos-0 hover:bg-pos-100 flex shrink-0 grow flex-col text-pretty bg-gradient-to-b from-transparent to-primary/5 p-4 transition-all duration-200">
        <h3 className="line-clamp-2 text-lg font-semibold transition-colors">{product.title}</h3>

        {}
        {variantInfo.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {variantInfo.map((info, infoIdx) => (
              <span
                key={`${info.name}-${infoIdx}`}
                className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-900"
              >
                {info.value}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col pt-3">
          {/* Medusa doesn't have vendor, checking metadata or type */}
          {!!product.type?.value && <p className="text-sm text-gray-500">{product.type.value}</p>}

          <div className="flex flex-wrap items-center gap-1">
            {!!product.avgRating && !!product.totalReviews && (
              <>
                <div className="flex items-center space-x-1">
                  <StarIcon className="size-3.5 fill-gray-800/95 stroke-gray-800/95" />

                  <div className="flex items-center gap-0.5 text-sm font-medium">
                    <div>{product.avgRating.toFixed(2)}</div>
                    <span className="text-xs text-gray-500">
                      ({product.totalReviews} review{product.totalReviews !== 1 && "s"})
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {!!variantPrice && (
          <div className="mt-auto flex flex-col pt-10">
            <div className="flex w-full items-baseline justify-between text-sm">
              <span className="text-primary/50">Price</span>
              <span className="text-base font-semibold md:text-lg">
                {mapCurrencyToSign((variantPrice.currencyCode as CurrencyType) || "USD") +
                  Number(variantPrice.amount).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}

export default async function Favorites() {
  return (
    <div className="mx-auto flex max-w-container-md flex-col gap-16 px-4 py-20 md:pb-32 md:pt-24 xl:px-0">
      <div className="basis-1/3 text-center font-medium tracking-tighter sm:min-w-[280px] md:text-left md:text-6xl">
        <h2 className="text-5xl">Favorite products</h2>
      </div>
      <Suspense fallback={<FavoritesSkeleton />}>
        <FavoritesView />
      </Suspense>
    </div>
  )
}

async function FavoritesView() {
  const variantData = await getFavoritesVariantData()

  // Debug logs: favorite variant ids from cookie and resolved variant data
  try {
    const favoriteIds = await getFavoriteVariantIds()
    // server-side console logs — aparecerán en la terminal donde corras el servidor
    console.log("Favorites cookie variantIds:", favoriteIds)
    console.log(
      "Favorites resolved variantData:",
      variantData.map((v) => ({ variantHandle: v.variantHandle, variantId: v.variant?.id ?? null }))
    )
  } catch (e) {
    console.log("Error logging favorite ids:", e)
  }

  return (
    <>
      {variantData.length === 0 ? (
        <p className="text-lg tracking-tight">
          No favorite products. You can add them by clicking on a heart icon on product page
        </p>
      ) : null}
      <div className="grid w-full grid-cols-[repeat(_auto-fill,minmax(140px,1fr)_)] items-start gap-4 gap-y-8 md:grid-cols-[repeat(_auto-fill,minmax(280px,1fr)_)]">
        {variantData.map((item, idx) => (
          <FavoriteProductCard
            key={`favorite-${item.variantHandle}-${idx}`}
            product={item.product}
            variant={item.variant}
            featuredImage={item.featuredImage}
            variantInfo={item.variantInfo}
            href={`/product/${item.variantHandle}`}
            priority={[0, 1].includes(idx)}
          />
        ))}
      </div>
    </>
  )
}

function FavoritesSkeleton() {
  return (
    <section className="grid w-full grid-cols-[repeat(_auto-fill,minmax(140px,1fr)_)] items-start gap-4 gap-y-8 md:grid-cols-[repeat(_auto-fill,minmax(280px,1fr)_)]">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={`skeleton-${index}`} className="flex h-[258px] w-full flex-col gap-4 md:h-[430px]">
          <Skeleton className="h-[320px]" />
          <div>
            <Skeleton className="h-[25px] w-3/4" />
            <Skeleton className="mt-1 h-[32px] w-12" />
          </div>
        </div>
      ))}
    </section>
  )
}

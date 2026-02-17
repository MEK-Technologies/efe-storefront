// DEPRECATED: This metadata generation is not used with the new variant-only approach
// Metadata is now handled directly in page.tsx using the variant.product data

import { env } from "env.mjs"
import { Product, WithContext } from "schema-dts"
import type { CommerceProduct } from "types"
import { getFeaturedImage, getMinPrice } from "utils/medusa-product-helpers"

// The generateJsonLd function is still used in page.tsx for structured data
export function generateJsonLd(product: CommerceProduct, slug: string) {
  const images = product.images ?? []
  const minPriceData = getMinPrice(product.variants)
  const featuredImage = getFeaturedImage(product)
  
  // Get brand from metadata or product type
  const brand = (product.metadata?.brand as string) || product.type?.value
  const imageUrls = [
    featuredImage?.url,
    ...images.map((image) => image.url),
  ].filter((url): url is string => Boolean(url))

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? undefined,
    image: imageUrls,
    ...(brand && {
      brand: {
        "@type": "Brand",
        name: brand,
      },
    }),
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "US",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 30,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
    },
    offers: {
      "@type": "Offer",
      url: `${env.LIVE_URL}/product/${slug}`,
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      price: minPriceData?.amount ?? 0,
      priceCurrency: minPriceData?.currencyCode ?? "USD",
    },
  } satisfies WithContext<Product>
}

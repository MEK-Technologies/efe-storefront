import { getProduct } from "lib/algolia"
import { env } from "env.mjs"
import { Metadata } from "next"
import { Product, WithContext } from "schema-dts"
import type { CommerceProduct } from "types"
import { makeKeywords } from "utils/make-keywords"
import { removeOptionsFromUrl } from "utils/product-options-utils"
import { slugToName } from "utils/slug-name"
import { getMinPrice, getFeaturedImage } from "utils/medusa-product-helpers"

interface ProductProps {
  params: { slug: string }
}

export async function generateMetadata({ params: { slug } }: ProductProps): Promise<Metadata> {
  const product = await getProduct(removeOptionsFromUrl(slug))

  // Use product title/description directly (Medusa doesn't have separate SEO fields)
  const keywords = makeKeywords(product?.title)
  // Use Medusa's collection (singular) instead of collections (plural)
  const collection = product?.collection

  return {
    title: `${product?.title || "Product"} | Blazity`,
    description: product?.description,
    generator: "Next.js",
    applicationName: "Next.js",
    referrer: "origin-when-cross-origin",
    keywords: keywords,
    category: collection ? slugToName(collection.handle ?? "") : "Search",
    creator: "Blazity",
    alternates: {
      canonical: `/product/${slug}`,
    },
    publisher: "Blazity",
  }
}

export function generateJsonLd(product: CommerceProduct, slug: string) {
  const images = product.images ?? []
  const minPriceData = getMinPrice(product.variants)
  const featuredImage = getFeaturedImage(product)
  
  // Get brand from metadata or product type
  const brand = (product.metadata?.brand as string) || product.type?.value

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: images.map((image) => image.url),
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

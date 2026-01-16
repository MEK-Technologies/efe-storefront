import { makeKeywords } from "utils/make-keywords"
import { removeOptionsFromUrl } from "utils/product-options-utils"
import type { ProductReviewsPageProps } from "./page"
import { Metadata } from "next"
import { getProduct } from "lib/algolia"
import { env } from "env.mjs"

export async function generateMetadata(props: ProductReviewsPageProps): Promise<Metadata> {
  const slug = (await props.params).slug
  const product = await getProduct(removeOptionsFromUrl(slug))

  // Medusa products just use 'title', no separate 'seo.title' usually
  const title = product?.title
  const keywords = makeKeywords(`${product?.title} reviews rating feedback`)
  // Use Medusa collection (singular)
  const collection = product?.collection

  return {
    metadataBase: new URL(env.LIVE_URL!),
    title: `${title} Reviews & Feedback | Blazity`,
    description: `Discover What People Are Saying About ${title} `,
    generator: "Next.js",
    applicationName: "Next.js",
    referrer: "origin-when-cross-origin",
    keywords: keywords,
    category: collection?.title || "",
    creator: "Blazity",
    alternates: {
      canonical: `/reviews/${slug}`,
    },
    publisher: "Blazity",
  }
}

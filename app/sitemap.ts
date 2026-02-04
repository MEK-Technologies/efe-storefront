import { env } from "env.mjs"
import { MetadataRoute } from "next"
import { getCategories, getProducts } from "lib/algolia"
import { HITS_PER_PAGE } from "constants/index"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.LIVE_URL || "https://commerce.blazity.com"

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(new Date().setHours(0, 0, 0, 0)),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/`,
      lastModified: new Date(new Date().setHours(0, 0, 0, 0)),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/terms-conditions`,
      lastModified: new Date(),
      priority: 0.1,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      priority: 0.1,
    },
  ]

  // Algolia may be disabled or unreachable during builds; fall back to static routes.
  let allHits: Array<{ handle?: string; updated_at?: string }> = []
  let allCollections: Array<{ handle?: string; updated_at?: string }> = []

  try {
    allHits = (
      await getProducts({
        hitsPerPage: 50,
        attributesToRetrieve: ["handle", "updated_at"],
      })
    ).hits as any

    allCollections = (
      await getCategories({
        hitsPerPage: 50,
        attributesToRetrieve: ["handle", "updated_at"],
      })
    ).hits as any
  } catch {
    return staticRoutes
  }

  const paginationRoutes = Array.from({ length: Math.ceil(allHits.length / HITS_PER_PAGE) }, (_, i) => {
    const item: MetadataRoute.Sitemap[0] = {
      url: `${baseUrl}/search?page=${i + 1}`,
      priority: 0.5,
      changeFrequency: "monthly",
    }
    return item
  })

  const productRoutes = allHits
    .filter((hit): hit is { handle: string; updated_at?: string } => Boolean(hit?.handle))
    .map((hit) => {
    const item: MetadataRoute.Sitemap[0] = {
      url: `${baseUrl}/product/${hit.handle}`,
      lastModified: hit.updated_at ?? new Date(),
      priority: 0.5,
      changeFrequency: "monthly",
    }
    return item
  })

  const collectionsRoutes = allCollections
    .filter((c): c is { handle: string; updated_at?: string } => Boolean(c?.handle))
    .map(({ handle, updated_at }) => {
    const item: MetadataRoute.Sitemap[0] = {
      url: `${baseUrl}/category/${handle}`,
      lastModified: updated_at,
      priority: 0.5,
      changeFrequency: "monthly",
    }
    return item
  })

  return [...staticRoutes, ...paginationRoutes, ...productRoutes, ...collectionsRoutes]
}

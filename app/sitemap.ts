import { env } from "env.mjs"
import { MetadataRoute } from "next"
import { getCategories, getProducts } from "lib/algolia"
import { HITS_PER_PAGE } from "constants/index"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${env.LIVE_URL}/`,
      lastModified: new Date(new Date().setHours(0, 0, 0, 0)),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${env.LIVE_URL}/`,
      lastModified: new Date(new Date().setHours(0, 0, 0, 0)),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${env.LIVE_URL}/terms-conditions`,
      lastModified: new Date(),
      priority: 0.1,
    },
    {
      url: `${env.LIVE_URL}/privacy-policy`,
      lastModified: new Date(),
      priority: 0.1,
    },
  ]

  const allHits = (
    await getProducts({
      hitsPerPage: 50,
      attributesToRetrieve: ["handle", "updated_at"],
    })
  ).hits

  const allCollections = (
    await getCategories({
      hitsPerPage: 50,
      attributesToRetrieve: ["handle", "updated_at"],
    })
  ).hits

  const paginationRoutes = Array.from({ length: allHits.length / HITS_PER_PAGE }, (_, i) => {
    const item: MetadataRoute.Sitemap[0] = {
      url: `${env.LIVE_URL}/search?page=${i + 1}`,
      priority: 0.5,
      changeFrequency: "monthly",
    }
    return item
  })

  const productRoutes = allHits.map((hit) => {
    const item: MetadataRoute.Sitemap[0] = {
      url: `${env.LIVE_URL}/product/${hit.handle}`,
      lastModified: hit.updated_at ?? new Date(),
      priority: 0.5,
      changeFrequency: "monthly",
    }
    return item
  })

  const collectionsRoutes = allCollections.map(({ handle, updated_at }) => {
    const item: MetadataRoute.Sitemap[0] = {
      url: `${env.LIVE_URL}/category/${handle}`,
      lastModified: updated_at,
      priority: 0.5,
      changeFrequency: "monthly",
    }
    return item
  })

  return [...staticRoutes, ...paginationRoutes, ...productRoutes, ...collectionsRoutes]
}

import "server-only"

import type { Payload } from "payload"
import { getPayloadClient } from "lib/payload-client"

type PayloadMedia = {
  id: number | string
  url?: string
  alt?: string
}

export type CmsCollection = {
  id: number | string
  title?: string
  handle?: string
  img_url?: PayloadMedia | null
  // metadata and products are available on the raw doc, but we don't need them for the home section yet
}

export async function getCollections(limit = 8): Promise<CmsCollection[]> {
  let payload: Payload

  try {
    payload = await getPayloadClient()
  } catch (err) {
    console.error("Failed to initialize Payload client for collections", err)
    return []
  }

  try {
    const { docs } = await payload.find({
      collection: "collections",
      depth: 1,
      limit,
      sort: "-updatedAt",
    })

    if (!docs || !Array.isArray(docs)) {
      return []
    }

    const collections: CmsCollection[] = docs.map((doc: any) => {
      const media =
        doc.img_url && typeof doc.img_url === "object" ? (doc.img_url as PayloadMedia) : null

      return {
        id: doc.id,
        title: doc.title,
        handle: doc.handle,
        img_url: media,
      }
    })

    return collections
  } catch (err) {
    console.error("Failed to fetch collections via Payload SDK", err)
    return []
  }
}


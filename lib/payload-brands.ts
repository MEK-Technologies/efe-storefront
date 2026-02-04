import "server-only"

import type { Payload } from "payload"
import { getPayloadClient } from "lib/payload-client"

type PayloadMedia = {
  id: number | string
  url?: string
  alt?: string
}

export type CmsBrand = {
  id: number | string
  name?: string
  logo?: PayloadMedia | null
}

export async function getBrands(): Promise<CmsBrand[]> {
  let payload: Payload

  try {
    payload = await getPayloadClient()
  } catch (err) {
    console.error("Failed to initialize Payload client for brands", err)
    return []
  }

  try {
    const { docs } = await payload.find({
      collection: "brands-carousel" as any,
      depth: 2,
      limit: 50,
      sort: "-updatedAt",
    })

    if (!docs || !Array.isArray(docs)) {
      return []
    }

    const brands: CmsBrand[] = docs.map((doc: any) => {
      const media = doc.logo && typeof doc.logo === "object" ? (doc.logo as PayloadMedia) : null

      return {
        id: doc.id,
        name: doc.name,
        logo: media,
      }
    })

    return brands
  } catch (err) {
    console.error("Failed to fetch brands via Payload SDK", err)
    return []
  }
}

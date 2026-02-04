import "server-only"

import type { Payload } from "payload"
import { getPayloadClient } from "lib/payload-client"

type PayloadMedia = {
  id: number | string
  url?: string
  alt?: string
}

type PayloadCategory = {
  id: number | string
  name?: string
  handle?: string
}

export type CmsSlide = {
  id: number | string
  title?: string
  context?: string
  action_boton?: PayloadCategory | null
  img_url?: PayloadMedia | null
  product_star?: string | null
}

export async function getSlides(): Promise<CmsSlide[]> {
  let payload: Payload

  try {
    payload = await getPayloadClient()
  } catch (err) {
    console.error("Failed to initialize Payload client for slides", err)
    return []
  }

  try {
    const { docs } = await payload.find({
      collection: "slides",
      depth: 2,
      limit: 50,
      sort: "-updatedAt",
    })

    if (!docs || !Array.isArray(docs)) {
      return []
    }

    const slides: CmsSlide[] = docs.map((doc: any) => {
      const media = doc.img_url && typeof doc.img_url === "object" ? (doc.img_url as PayloadMedia) : null
      const category =
        doc.action_boton && typeof doc.action_boton === "object" ? (doc.action_boton as PayloadCategory) : null

      return {
        id: doc.id,
        title: doc.title,
        context: doc.context,
        action_boton: category,
        img_url: media,
        product_star: doc.product_star ?? null,
      }
    })

    return slides
  } catch (err) {
    console.error("Failed to fetch slides via Payload SDK", err)
    return []
  }
}


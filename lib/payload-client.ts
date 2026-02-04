import "server-only"

import configPromise from "@payload-config"
import { getPayloadHMR } from "@payloadcms/next/utilities"
import type { Payload } from "payload"

let cachedPayload: Payload | null = null

export async function getPayloadClient(): Promise<Payload> {
  if (cachedPayload) {
    return cachedPayload
  }

  const config = await configPromise
  const payload = await getPayloadHMR({ config })
  cachedPayload = payload

  return payload
}


import Medusa from "@medusajs/js-sdk"
import { env } from "../../env.mjs"

export const sdk = new Medusa({
  baseUrl: env.MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
  auth: {
    type: "session", // Use HTTP-only cookies for secure authentication
  },
})

console.log("Medusa SDK initialized with publishable key:", env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY)
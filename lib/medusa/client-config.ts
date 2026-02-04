import Medusa from "@medusajs/js-sdk"

// SDK configuration for client-side usage
// Uses NEXT_PUBLIC_ prefixed environment variables that are safe for the browser
export const clientSdk = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
  auth: {
    type: "session", // Usa cookies HTTP-only para mayor seguridad
  },
})

console.log("Client Medusa SDK initialized with publishable key:", process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY)

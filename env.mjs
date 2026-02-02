import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  server: {
    // Algolia variables (optional when using Algolia-backed search/product pages)
    ALGOLIA_PRODUCTS_INDEX: z.string().optional(),
    ALGOLIA_CATEGORIES_INDEX: z.string().optional(),
    ALGOLIA_APP_ID: z.string().optional(),
    ALGOLIA_WRITE_API_KEY: z.string().optional(),  // Solo para operaciones de escritura (servidor)
    ALGOLIA_SEARCH_API_KEY: z.string().optional(), // Para búsquedas (puede exponerse al cliente)
    ALGOLIA_REVIEWS_INDEX: z.string().optional(),
    
    // Public site URL (used for metadata, sitemap, og images, etc.)
    LIVE_URL: z.string().url().optional(),

    // Third-party integrations
    GTM_ID: z.string().optional(),
    IS_VERCEL_ANALYTICS_ENABLED: z.string().optional(),
    IS_GTM_ENABLED: z.string().optional(),
    IS_SPEED_INSIGHTS_ENABLED: z.string().optional(),

    // Shopify (optional; only needed if Shopify pages/collections are enabled)
    SHOPIFY_STORE_DOMAIN: z.string().optional(),
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().optional(),
    SHOPIFY_ADMIN_ACCESS_TOKEN: z.string().optional(),
    SHOPIFY_APP_API_SECRET_KEY: z.string().optional(),

    // Judge.me (optional; used for reviews feature)
    JUDGE_BASE_URL: z.string().optional(),
    JUDGE_API_TOKEN: z.string().optional(),

    // AI integrations (optional)
    OPENAI_API_KEY: z.string().optional(),
    REPLICATE_API_KEY: z.string().optional(),

    // Medusa variables are required
    MEDUSA_BACKEND_URL: z.string(),
    
    // Payload CMS variables (optional - only needed if using Payload)
    PAYLOAD_SECRET: z.string().min(32).optional(),
    PAYLOAD_DATABASE_URL: z.string().optional(),
    PAYLOAD_SERVER_URL: z.string().url().optional(),
    PAYLOAD_API_KEY: z.string().optional(),
    
    // Bytescale variables (optional - for file uploads with Payload CMS)
    // If you want to use Bytescale, all three variables are required
    BYTESCALE_API_KEY: z.string().optional(),
    BYTESCALE_ACCOUNT_ID: z.string().optional(),
    BYTESCALE_PREFIX: z.string().default('/payload-uploads'),
    
    CRON_SECRET: z.string().optional(),
  },
  client: {
    // Medusa client variables
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: z.string().url(),
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: z.string(),
  },
  // Custom validation: If one Bytescale var is set, all must be set
  runtimeEnv: process.env,
})

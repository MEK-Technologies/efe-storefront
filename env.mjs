import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  server: {
    // Algolia variables are optional - only needed if using Algolia search
    ALGOLIA_PRODUCTS_INDEX: z.string().optional(),
    ALGOLIA_CATEGORIES_INDEX: z.string().optional(),
    ALGOLIA_APP_ID: z.string().optional(),
    ALGOLIA_WRITE_API_KEY: z.string().optional(),
    
    // Medusa variables are required
    MEDUSA_BACKEND_URL: z.string(),
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: z.string(),
    
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
  // Custom validation: If one Bytescale var is set, all must be set
  runtimeEnv: process.env,
})

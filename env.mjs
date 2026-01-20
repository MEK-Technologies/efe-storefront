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
    
    CRON_SECRET: z.string().optional(),
  },
})

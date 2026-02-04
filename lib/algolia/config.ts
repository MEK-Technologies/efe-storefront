import { env } from "../../env.mjs"

/**
 * Verifica si Algolia está configurado correctamente
 */
export function isAlgoliaConfigured(): boolean {
  return !!(
    env.ALGOLIA_APP_ID &&
    env.ALGOLIA_WRITE_API_KEY &&
    env.ALGOLIA_PRODUCTS_INDEX &&
    env.ALGOLIA_CATEGORIES_INDEX
  )
}

/**
 * Lanza error si Algolia no está configurado cuando se requiere
 */
export function requireAlgolia(operation: string): void {
  if (!isAlgoliaConfigured()) {
    throw new Error(
      `Algolia is not configured properly. ` +
      `Operation '${operation}' requires ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY, ` +
      `ALGOLIA_PRODUCTS_INDEX, and ALGOLIA_CATEGORIES_INDEX environment variables. ` +
      `Please check your .env.local file.`
    )
  }
}

/**
 * Obtiene la configuración de Algolia si está disponible
 */
export function getAlgoliaConfig() {
  return {
    appId: env.ALGOLIA_APP_ID,
    apiKey: env.ALGOLIA_WRITE_API_KEY,
    searchApiKey: env.ALGOLIA_SEARCH_API_KEY,
    productsIndex: env.ALGOLIA_PRODUCTS_INDEX,
    categoriesIndex: env.ALGOLIA_CATEGORIES_INDEX,
    reviewsIndex: env.ALGOLIA_REVIEWS_INDEX,
  }
}

/**
 * Log helper para operaciones de Algolia
 */
export function logAlgoliaOperation(operation: string, details?: any) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Algolia] ${operation}`, details || "")
  }
}

/**
 * Valida índices requeridos
 */
export function validateAlgoliaIndices(): void {
  const config = getAlgoliaConfig()
  
  if (!config.productsIndex) {
    throw new Error("ALGOLIA_PRODUCTS_INDEX is required for Algolia operations")
  }
  
  if (!config.categoriesIndex) {
    throw new Error("ALGOLIA_CATEGORIES_INDEX is required for Algolia operations")  
  }
}
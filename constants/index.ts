// Cookies utilizadas en el proyecto (prefijo _medusa_ es estándar de Medusa.js)
export const COOKIE_CART_ID = "_medusa_cart_id"
export const COOKIE_AUTH_TOKEN = "_medusa_jwt"
export const COOKIE_ADMIN_TOKEN = "_medusa_admin_jwt"
export const COOKIE_CACHE_ID = "_medusa_cache_id"
export const COOKIE_FAVORITES = "ecom_favorites"

/**
 * Default country code for the store
 * This should match your Medusa backend region configuration
 */
export const DEFAULT_COUNTRY_CODE = "do" as const

export const TAGS = {
  CART: "cart",
} as const

export const BUCKETS = {
  HOME: ["a", "b"],
} as const

export const facetParams = [
  "q",
  "minPrice",
  "maxPrice",
  "sortBy",
  "categories",
  "vendors",
  "tags",
  "colors",
  "sizes",
  "rating",
] as const
export const HIERARCHICAL_ATRIBUTES = [
  "hierarchicalCategories.lvl0",
  "hierarchicalCategories.lvl1",
  "hierarchicalCategories.lvl2",
] as const
export const HIERARCHICAL_SEPARATOR = " > "
export const HITS_PER_PAGE = 24

export type SortOptions = "price_asc" | "price_desc" | "created_at"
interface MedusaApiError {
  response?: {
    data:
      | {
          message?: string
        }
      | string
    status: number
    headers: Record<string, string>
  }
  config?: {
    url: string
    baseURL: string
  }
  request?: unknown
  message?: string
}

export default function medusaError(error: MedusaApiError): never {
  if (error.response && error.config) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const u = new URL(error.config.url, error.config.baseURL)
    console.error("Resource:", u.toString())
    console.error("Response data:", error.response.data)
    console.error("Status code:", error.response.status)
    console.error("Headers:", error.response.headers)

    // Extracting the error message from the response data
    const message =
      typeof error.response.data === "object"
        ? error.response.data.message || JSON.stringify(error.response.data)
        : error.response.data

    throw new Error(message.charAt(0).toUpperCase() + message.slice(1) + ".")
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error("No response received: " + String(error.request))
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(
      "Error setting up the request: " + (error.message || "Unknown error")
    )
  }
}

import { HttpTypes } from "@medusajs/types"

interface MinPricedProduct extends HttpTypes.StoreProduct {
  _minPrice?: number
}

/**
 * Helper function to sort products by price until the store API supports sorting by price
 * @param products
 * @param sortBy
 * @returns products sorted by price
 */
export function sortProducts(
  products: HttpTypes.StoreProduct[],
  sortBy: SortOptions
): HttpTypes.StoreProduct[] {
  const sortedProducts = products as MinPricedProduct[]

  if (["price_asc", "price_desc"].includes(sortBy)) {
    // Precompute the minimum price for each product
    sortedProducts.forEach((product) => {
      if (product.variants && product.variants.length > 0) {
        product._minPrice = Math.min(
          ...product.variants.map(
            (variant) => variant?.calculated_price?.calculated_amount || 0
          )
        )
      } else {
        product._minPrice = Infinity
      }
    })

    // Sort products based on the precomputed minimum prices
    sortedProducts.sort((a, b) => {
      const diff = a._minPrice! - b._minPrice!
      return sortBy === "price_asc" ? diff : -diff
    })
  }

  if (sortBy === "created_at") {
    sortedProducts.sort((a, b) => {
      return (
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      )
    })
  }

  return sortedProducts
}

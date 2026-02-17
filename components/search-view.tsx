import { HitsSection } from "components/filters/hits-section"
import { PaginationSection } from "components/filters/pagination-section"
import { SearchParamsType } from "types"
import { Sorter } from "./filters/sorter"
import { SortOptions, sortProducts } from "lib/medusa/util"
import { HttpTypes } from "@medusajs/types"
import { DEFAULT_COUNTRY_CODE } from "constants/index"
import { sdk } from "lib/medusa/config"
import { getRegion } from "lib/medusa/data/regions"
import { getAuthHeaders, getCacheOptions } from "lib/medusa/data/cookies"
import { getProductsBySearch } from "lib/medusa/data/product-queries"

interface SearchViewProps {
  searchParams: SearchParamsType
  params?: { slug: string; page?: string }
  category?: HttpTypes.StoreProductCategory
  collection?: HttpTypes.StoreCollection
  initialProducts?: HttpTypes.StoreProduct[]
  count?: number
  disabledFacets?: string[]
  basePath?: string
}

export async function SearchView({
  searchParams,
  category,
  collection,
  initialProducts,
  count: initialCount,
  basePath,
}: SearchViewProps) {
  const { sortBy, page, q } = searchParams
  const currentPage = page ? parseInt(page as string) : 1
  const sort = (sortBy as SortOptions) || "created_at"
  const searchQuery = q as string | undefined
  const limit = 12

  let products = initialProducts
  let count = initialCount || 0

  // Only fetch if initial data wasn't provided
  if (!products) {
    const region = await getRegion(DEFAULT_COUNTRY_CODE)
    
    if (!region) {
      products = []
      count = 0
    } else {
      const headers = {
        ...(await getAuthHeaders()),
      }

      const next = {
        ...(await getCacheOptions("products")),
      }

      // Utilizar la nueva función que descompone productos en variantes y aplica filtrado estricto
      const variantProducts = await getProductsBySearch(searchQuery || "", 1000)

      // Apply sorting to all products
      const sortedProducts = sortProducts(variantProducts, sort)

      // Apply client-side pagination
      const pageParam = (currentPage - 1) * limit
      products = sortedProducts.slice(pageParam, pageParam + limit)
      count = sortedProducts.length // Use total variants count for pagination
    }
  }

  // Mocking facets for now as Medusa requires specific logic for various aggregations
  // const facets = {} 
  const title = searchQuery 
    ? `Resultados de búsqueda para "${searchQuery}"`
    : category?.name || collection?.title || "Búsqueda"

  return (
    <div className="px-4 pb-10">
      <div className="mx-auto w-full max-w-container-sm">
        <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          <div className="flex items-center">
            <Sorter />
          </div>
        </div>

        <section aria-labelledby="products-heading" className="pb-24 pt-6">
          <HitsSection hits={products as any} basePath={basePath} />
          <div className="mt-10">
            <PaginationSection
              queryParams={searchParams}
              totalPages={Math.ceil(count / 12)}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
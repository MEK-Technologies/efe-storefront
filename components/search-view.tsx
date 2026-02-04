import { Suspense } from "react"
import { listProductsWithSort } from "lib/medusa/data/products"
import { HitsSection } from "components/filters/hits-section"
import { PaginationSection } from "components/filters/pagination-section"
import { SearchParamsType } from "types"
import { Sorter } from "./filters/sorter"
import { SortOptions } from "lib/medusa/util"
import { HttpTypes } from "@medusajs/types"
import { DEFAULT_COUNTRY_CODE } from "constants/index"

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

  let products = initialProducts
  let count = initialCount || 0

  // Only fetch if initial data wasn't provided
  if (!products) {
    const queryParams: any = {
      limit: 12,
    }

    // Add search query if provided
    if (searchQuery) {
      queryParams.q = searchQuery
    }

    if (category) {
      queryParams.category_id = [category.id]
    }

    if (collection) {
      queryParams.collection_id = [collection.id]
    }

    const { response } = await listProductsWithSort({
      page: currentPage,
      countryCode: DEFAULT_COUNTRY_CODE,
      sortBy: sort,
      queryParams
    })
    products = response.products
    count = response.count
  }

  // Mocking facets for now as Medusa requires specific logic for various aggregations
  const facets = {} 
  const title = searchQuery 
    ? `Search results for "${searchQuery}"`
    : category?.name || collection?.title || "Search"

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
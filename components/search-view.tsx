import { Suspense } from "react"
import { listProductsWithSort } from "lib/medusa/data/products"
import { FacetsDesktop } from "components/filters/facets-desktop"
import { HitsSection } from "components/filters/hits-section"
import { PaginationSection } from "components/filters/pagination-section"
import { FacetsMobile } from "components/filters/facets-mobile"
import { SearchParamsType } from "types"
import { Sorter } from "./filters/sorter"
import { SortOptions } from "lib/medusa/util"
import { HttpTypes } from "@medusajs/types"

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
  const { sortBy, page } = searchParams
  const currentPage = page ? parseInt(page as string) : 1
  const sort = (sortBy as SortOptions) || "created_at"

  let products = initialProducts
  let count = initialCount || 0

  // Only fetch if initial data wasn't provided
  if (!products) {
    const queryParams: any = {
      limit: 12,
    }

    if (category) {
      queryParams.category_id = [category.id]
    }

    if (collection) {
      queryParams.collection_id = [collection.id]
    }

    const { response } = await listProductsWithSort({
      page: currentPage,
      countryCode: "us", // Should be dynamic based on context
      sortBy: sort,
      queryParams
    })
    products = response.products
    count = response.count
  }

  // Mocking facets for now as Medusa requires specific logic for various aggregations
  const facets = {} 
  const title = category?.name || collection?.title || "Search"

  return (
    <div className="flex flex-col gap-8 pb-10">
        <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          <div className="flex items-center">
            <Sorter className="hidden lg:block" />
            <FacetsMobile
              facetDistribution={facets as any}
              independentFacetDistribution={facets as any}
              categoryDisplayTypes={{}}
            />
          </div>
        </div>

        <section aria-labelledby="products-heading" className="pb-24 pt-6">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
            <FacetsDesktop
              facetDistribution={facets as any}
              independentFacetDistribution={facets as any}
              categoryDisplayTypes={{}}
              className="hidden lg:block"
            />

            <div className="lg:col-span-3">
              <HitsSection hits={products as any} basePath={basePath} />
              <div className="mt-10">
                <PaginationSection
                  queryParams={searchParams}
                  totalPages={Math.ceil(count / 12)}
                />
              </div>
            </div>
          </div>
        </section>
    </div>
  )
}
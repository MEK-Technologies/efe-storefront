import { notFound } from "next/navigation"
import { SearchParamsType } from "types"
import { getCategoryByHandle } from "lib/medusa/data/categories"
import { listProductsWithSort } from "lib/medusa/data/products"
import { SearchView } from "components/search-view"
import { SortOptions } from "lib/medusa/util"

interface CategoryPLPViewProps {
  params: { slug: string; page?: string }
  searchParams?: SearchParamsType
  basePath?: string
}

export async function CategoryPLPView({
  params,
  searchParams,
  basePath = "/category/plp",
}: CategoryPLPViewProps) {
  const { slug, page } = params
  const searchParamsValue = await searchParams
  const sort = (searchParamsValue?.sortBy as SortOptions) || "created_at"
  const currentPage = page ? parseInt(page) : 1

  // 1. Fetch Category
  // getCategoryByHandle returns StoreProductCategory
  const category = await getCategoryByHandle([slug])

  if (!category) {
    return notFound()
  }

  // 2. Fetch Products with Sort and Pagination
  // Using listProductsWithSort from your lib/medusa/data/products.ts
  const { response: { products, count } } = await listProductsWithSort({
    page: currentPage,
    countryCode: "us", 
    sortBy: sort,
    queryParams: {
      category_id: [category.id],
      limit: 12 // Standard grid size
    } as any
  })

  return (
    <SearchView
      searchParams={searchParamsValue || {}}
      params={params}
      category={category}
      initialProducts={products}
      count={count}
      basePath={basePath}
    />
  )
}
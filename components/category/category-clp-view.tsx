import { notFound } from "next/navigation"
import { SearchParamsType } from "types"
import { getCategoryByHandle } from "lib/medusa/data/categories"
import { listProducts } from "lib/medusa/data/products"
import { CategoryLandingPage } from "./category-landing-page"
import { getPageDisplayTypeByHandle } from "utils/get-page-display-type"
import { DEFAULT_COUNTRY_CODE } from "constants/index"

interface CategoryCLPViewProps {
  params: { slug: string; page?: string }
  searchParams?: SearchParamsType
  basePath?: string
}

export async function CategoryCLPView({
  params,
  searchParams,
  basePath = "/category/clp",
}: CategoryCLPViewProps) {
  const { slug } = params
  
  // 1. Fetch the category using your existing Medusa data function
  // getCategoryByHandle expects an array of strings in your lib
  const category = await getCategoryByHandle([slug])

  if (!category) {
    return notFound()
  }

  // 2. Fetch products for this category
  // We use listProducts from your medusa/data/products.ts
  const { response: { products } } = await listProducts({
    countryCode: DEFAULT_COUNTRY_CODE,
    queryParams: {
      category_id: [category.id],
      limit: 8 // Fetch a few for the landing page showcase
    }
  })

  // 3. Determine display type (optional, based on your existing logic)
  const pageDisplayType = getPageDisplayTypeByHandle(slug)

  // 4. Map Medusa Category to the structure expected by CategoryLandingPage
  // Note: We might need to adjust types in CategoryLandingPage or map here.
  // Assuming strict prop compatibility or simple mapping:
  const platformCollection = {
    id: category.id,
    handle: category.handle,
    title: category.name,
    description: category.description,
    descriptionHtml: category.description, // Medusa doesn't distinguish HTML desc by default
    updatedAt: category.updated_at,
    image: null, // Categories in Medusa V2 don't always have images on the root object depending on plugins
    seo: {
      title: category.name,
      description: category.description
    }
  }

  return (
    <CategoryLandingPage
      collection={platformCollection}
      products={products as any} // Cast to CommerceProduct if types slightly mismatch
      basePath={basePath}
    />
  )
}
import type { Metadata } from "next"
import { SearchParamsType } from "types"
import { CategoryPLPView } from "components/category/category-plp-view"
import { getCategoryByHandle } from "lib/medusa/data/categories"

interface ProductListingPageProps {
  searchParams: Promise<SearchParamsType>
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: ProductListingPageProps): Promise<Metadata> {
  const params = await props.params
  const category = await getCategoryByHandle([params.slug])

  if (!category) return {}

  return {
    title: category.name,
    description: category.description,
  }
}

export default async function ProductListingPage(props: ProductListingPageProps) {
  const params = await props.params
  const searchParams = await props.searchParams

  return <CategoryPLPView params={params} searchParams={searchParams} />
}
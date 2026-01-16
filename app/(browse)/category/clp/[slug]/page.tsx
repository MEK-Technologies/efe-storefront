import type { Metadata } from "next"
import { CategoryCLPView } from "components/category/category-clp-view"
import { SearchParamsType } from "types"
import { getCategoryByHandle } from "lib/medusa/data/categories"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<SearchParamsType>
}

export async function generateMetadata(props: CategoryPageProps): Promise<Metadata> {
  const params = await props.params
  const category = await getCategoryByHandle([params.slug])

  if (!category) return {}

  return {
    title: category.name,
    description: category.description,
  }
}

export default async function CategoryPage(props: CategoryPageProps) {
  const params = await props.params
  const searchParams = await props.searchParams

  return <CategoryCLPView params={params} searchParams={searchParams} />
}
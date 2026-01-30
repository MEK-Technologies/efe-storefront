import { notFound } from "next/navigation"

export const revalidate = 86400
export const dynamic = "force-static"
export const dynamicParams = true

export { generateMetadata } from "./metadata"

export default async function StaticPage(props: { params: Promise<{ slug: string }> }) {
  // Shopify pages route is not used in this storefront.
  // Keeping the route for compatibility, but always 404 to avoid requiring Shopify env/config during builds.
  await props.params
  return notFound()
}

export async function generateStaticParams() {
  // No static params when Shopify pages are disabled.
  return []
}

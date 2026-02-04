import { BUCKETS, DEFAULT_COUNTRY_CODE } from "constants/index"
import { AnnouncementBar } from "app/(browse)/home/_components/announcement-bar"
import { HeroSection } from "app/(browse)/home/_components/hero-section"
import { EnterpriseCategoriesSection } from "app/(browse)/home/_components/enterprise-categories-section"
import { ModernNewArrivalsSection } from "app/(browse)/home/_components/modern-new-arrivals-section"
import { listProducts } from "lib/medusa/data/products"
import { CategoriesSection } from "../_components/categories-section"
import { BrandsCarouselSection } from "../_components/brands-carousel-section"

export const revalidate = 86400

export const dynamic = "force-static"

export const dynamicParams = true

export default async function Homepage(_props: { params: Promise<{ bucket: string }> }) {
  const {response: { products }} = await listProducts({
    countryCode: DEFAULT_COUNTRY_CODE
  })

  return (
    <div className="flex w-full flex-col">
      {/* <AnnouncementBar /> */}
      <HeroSection />
      <ModernNewArrivalsSection products={products} />
      <EnterpriseCategoriesSection />
      <CategoriesSection />
      <BrandsCarouselSection />
    </div>
  )
}

export async function generateStaticParams() {
  return BUCKETS.HOME.map((bucket) => ({ bucket }))
}

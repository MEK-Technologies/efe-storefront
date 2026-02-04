import { CarouselSection } from "app/(browse)/home/_components/carousel-section"
import type { CommerceProduct } from "types"
import { getSlides } from "lib/payload-slides"
import { getProduct } from "lib/algolia"

/**
 * Optional section that turns `product_star` from Slides into a product carousel.
 * This is not wired into the homepage by default; you can import and render it
 * from `[bucket]/page.tsx` when you're ready.
 */
export async function SlidesFeaturedProductsSection() {
  const slides = await getSlides()

  const productHandles = Array.from(
    new Set(
      slides
        .map((slide) => slide.product_star)
        .filter((handle): handle is string => !!handle)
    )
  )

  if (!productHandles.length) {
    return null
  }

  const productPromises = productHandles.map((handle) => getProduct(handle).catch(() => null))
  const products = (await Promise.all(productPromises)).filter(Boolean) as unknown as CommerceProduct[]

  if (!products.length) {
    return null
  }

  return <CarouselSection title="Productos estrella" items={products} />
}


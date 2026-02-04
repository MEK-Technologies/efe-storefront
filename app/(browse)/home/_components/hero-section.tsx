import { type HeroSlide, HomepageCarousel } from "components/homepage-carousel"
import { cn } from "utils/cn"
import { sdk } from "lib/medusa/config"
import { getImagesForCarousel } from "utils/visual-variant-utils"
import { getFeaturedImage, getMinPrice, getVariantPrice } from "utils/medusa-product-helpers"
import { type CmsSlide, getSlides } from "lib/payload-slides"
import { DEFAULT_COUNTRY_CODE } from "constants/index"
import { getRegion } from "lib/medusa/data/regions"

function getImageFromSlide(slide: CmsSlide): { url: string; alt: string } | null {
  const media = slide.img_url

  if (!media) {
    return null
  }

  const url = media.url

  if (!url) {
    return null
  }

  return {
    url,
    alt: media.alt || slide.title || "",
  }
}

function getCategoryCta(slide: CmsSlide): { href: string; text: string } {
  const rel = slide.action_boton

  if (rel && typeof rel !== "string") {
    const handle = rel.handle
    const name = rel.name

    if (handle) {
      return {
        href: `/category/clp/${handle}`,
        text: name || "Ver Categoría",
      }
    }

    if (name) {
      return {
        href: "/search",
        text: name,
      }
    }
  }

  return {
    href: "/search",
    text: "Ver Productos",
  }
}

export async function HeroSection({ className }: { className?: string }) {
  const slidesFromCms = await getSlides()

  if (!slidesFromCms.length) {
    console.log('[HeroSection] No slides found in CMS')
    return null
  }

  console.log(`[HeroSection] Loading ${slidesFromCms.length} slides from CMS`)

  // Get the region first
  const region = await getRegion(DEFAULT_COUNTRY_CODE)
  
  if (!region) {
    console.error('[HeroSection] Region not found for country code:', DEFAULT_COUNTRY_CODE)
  }

  const productPromises = slidesFromCms.map(async (slide) => {
    if (!slide.product_star) {
      return null
    }
    console.log(`[HeroSection] Fetching product from Medusa: ${slide.product_star}`)
    try {
      const queryParams: any = {}
      if (region?.id) {
        queryParams.region_id = region.id
      }
      
      const { product } = await sdk.store.product.retrieve(slide.product_star, queryParams)
      return product
    } catch (err: any) {
      console.error(`[HeroSection] Failed to fetch product ${slide.product_star}:`, err?.message || err)
      return null
    }
  })

  const products = await Promise.all(productPromises)
  
  products.forEach((product, index) => {
    const slide = slidesFromCms[index]
    if (slide.product_star && !product) {
      console.warn(`[HeroSection] Product not found in Medusa: ${slide.product_star} for slide: ${slide.title}`)
    } else if (product) {
      console.log(`[HeroSection] Product loaded for slide "${slide.title}":`, product.title)
    }
  })

  const heroSlides: HeroSlide[] = slidesFromCms
    .map((slide, index) => {
    const image = getImageFromSlide(slide)
    const { href, text } = getCategoryCta(slide)
    const product = products[index]

    if (!product) {
        if (!image?.url) {
          return null
        }

        return {
        id: slide.id,
          imageUrl: image.url,
        imageAlt: image?.alt || (slide.title ?? ""),
        title: slide.title || "",
        subtitle: slide.context || "",
        ctaText: text,
        ctaHref: href,
      }
    }

    const variants = product.variants ?? []

    // For now, no variantOptions coming from Slides; pick the first variant as a sensible default
    const variant = variants[0] ?? null

    let featuredImage = getFeaturedImage(product)
    const images = product.images ?? []

    if (variant && images.length > 0) {
      const colorValue = (variant?.options || []).find((o: any) => o.option_id?.toLowerCase?.().includes("color"))?.value

      if (colorValue) {
        const { images: carouselImages, activeIndex } = getImagesForCarousel(images, colorValue, "Color")
        if (activeIndex > 0 && carouselImages[activeIndex]) {
          const picked = carouselImages[activeIndex]
          featuredImage = picked?.url ? { url: picked.url, alt: product.title ?? "" } : featuredImage
        }
      }
    }

    const variantPrice = getVariantPrice(variant)
    const minPrice = getMinPrice(variants)

    const enhancedProduct = {
      ...product,
      featuredImage: featuredImage || undefined, // may still be undefined
      selectedVariant: variant || undefined,
      minPrice: variantPrice?.amount || minPrice?.amount || 0,
    } as any

    const imageUrl = image?.url || enhancedProduct.featuredImage?.url

    if (!imageUrl) {
      return null
    }

    const imageAlt = image?.alt || enhancedProduct.featuredImage?.alt || slide.title || ""

    return {
      id: slide.id,
      imageUrl,
      imageAlt,
      title: slide.title || "",
      subtitle: slide.context || "",
      ctaText: text,
      ctaHref: href,
      product: enhancedProduct,
    }
  })
    .filter((slide): slide is HeroSlide => slide !== null)

  return (
    <div className={cn("mb-4 w-full sm:mb-6 lg:mb-8", className)}>
      <HomepageCarousel slides={heroSlides} />
    </div>
  )
}


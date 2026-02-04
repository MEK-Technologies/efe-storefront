import { getBrands } from "lib/payload-brands"
import { BrandsCarouselClient } from "./brands-carousel-client"

interface BrandsCarouselSectionProps {
  className?: string
}

export async function BrandsCarouselSection({ className }: BrandsCarouselSectionProps) {
  try {
    const brands = await getBrands()
    
    console.log('[BrandsCarouselSection] Brands fetched:', brands?.length || 0)

    if (!brands || brands.length === 0) {
      console.log('[BrandsCarouselSection] No brands found, returning null')
      return null
    }

    return <BrandsCarouselClient brands={brands} className={className} />
  } catch (error) {
    console.error('[BrandsCarouselSection] Error fetching brands:', error)
    return null
  }
}

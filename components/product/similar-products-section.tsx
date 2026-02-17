import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "components/ui/carousel"
import { ProductCard } from "components/product-card"
import type { CommerceProduct } from "types"

interface SimilarProductsSectionProps {
  product: CommerceProduct
  currentVariantId: string
  slug: string
}

export async function SimilarProductsSection({ 
  product,
  currentVariantId,
  slug
}: SimilarProductsSectionProps) {
  
  // Use product.variants directly (already loaded from parent)
  const allVariants = product.variants || []
  
  // Filter out the current variant
  const otherVariants = allVariants.filter(v => v.id !== currentVariantId)
  
  console.log(`[SimilarProductsSection] Product: ${product.title}`)
  console.log(`[SimilarProductsSection] Total variants: ${allVariants.length}, Showing ${otherVariants.length} other variants`)
  
  if (otherVariants.length === 0) {
    console.log('[SimilarProductsSection] No other variants to display')
    return null
  }
  
  return (
    <section className="my-10">
      <h2 className="mb-10 text-[26px] font-medium tracking-[-0.78px]">Productos Similares</h2>
      <Carousel
        opts={{
          align: "start",
          skipSnaps: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {otherVariants.map((variant, idx) => {
            // Image resolution logic (parity with search and product page)
            let variantImage = product.thumbnail // Default to product thumbnail
            const variantMetadata = (variant as any).metadata || {}
            
            // Priority 1: Direct variant images
            if ((variant as any).images && (variant as any).images.length > 0) {
              variantImage = (variant as any).images[0].url
            }
            // Priority 2: Direct variant thumbnail
            else if ((variant as any).thumbnail) {
              variantImage = (variant as any).thumbnail
            }
            // Priority 3: Metadata image_ids
            else if (variantMetadata.image_ids && Array.isArray(variantMetadata.image_ids) && variantMetadata.image_ids.length > 0) {
               const foundImage = product.images?.find((img: any) => variantMetadata.image_ids.includes(img.id))
               if (foundImage) {
                 variantImage = foundImage.url
               }
            }
            // Priority 4: Metadata image_url
            else if (variantMetadata.image_url) {
              variantImage = variantMetadata.image_url
            }

            // Create a product-like structure for ProductCard
            // Each card represents the same product but with a different default variant
            const variantProduct = {
              ...product,
              thumbnail: variantImage, // Use resolved image
              // Use variant as the default variant for this card
              variants: [variant],
            }
            
            return (
              <CarouselItem className="basis-full md:basis-1/3 lg:basis-1/4" key={"variant_" + variant.id + idx}>
                <ProductCard
                  product={variantProduct as any}
                  prefetch
                />
              </CarouselItem>
            )
          })}
        </CarouselContent>
        <CarouselPrevious className="-left-4 top-1/2 hidden shadow-sm md:flex" />
        <CarouselNext className="-right-4 top-1/2 hidden shadow-sm md:flex" />
      </Carousel>
    </section>
  )
}

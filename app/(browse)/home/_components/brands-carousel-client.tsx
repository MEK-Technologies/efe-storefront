"use client"

import Image from "next/image"
import { cn } from "utils/cn"
import type { CmsBrand } from "lib/payload-brands"

interface BrandsCarouselClientProps {
  brands: CmsBrand[]
  className?: string
}

export function BrandsCarouselClient({ brands, className }: BrandsCarouselClientProps) {

  if (!brands || brands.length === 0) {
    return null
  }

  // Filter out brands without logos
  const brandsWithLogos = brands.filter((brand) => brand.logo?.url)

  if (brandsWithLogos.length === 0) {
    console.log('[BrandsCarouselClient] No brands with logos found')
    return null
  }

  // Duplicate brands multiple times for seamless infinite scroll
  const duplicatedBrands = [...brandsWithLogos, ...brandsWithLogos, ...brandsWithLogos]

  return (
    <section className={cn("relative w-full bg-muted/30 py-8", className)}>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Nuestras Marcas</h2>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex gap-8 animate-scroll-x hover:[animation-play-state:paused] will-change-transform">
            {duplicatedBrands.map((brand, index) => {
              const logo = brand.logo
              if (!logo?.url) return null

              return (
                <div
                  key={`${brand.id}-${index}`}
                  className="relative flex min-w-[150px] flex-[0_0_150px] items-center justify-center sm:min-w-[180px] sm:flex-[0_0_180px] md:min-w-[200px] md:flex-[0_0_200px]"
                >
                  <div className="relative h-20 w-full sm:h-24 md:h-28">
                    <Image
                      src={logo.url}
                      alt={logo.alt || brand.name || "Logo de marca"}
                      fill
                      className="object-contain object-center"
                      sizes="(max-width: 640px) 150px, (max-width: 768px) 180px, 200px"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

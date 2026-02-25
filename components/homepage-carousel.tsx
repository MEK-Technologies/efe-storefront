"use client"

import useEmblaCarousel from "embla-carousel-react"
import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "utils/cn"
import { Button } from "./ui/button"
import { CompactProductCard } from "./compact-product-card"
import type { CommerceProduct } from "types"

export interface HeroSlide {
  id: string
  imageUrl: string
  imageAlt: string
  title: string
  subtitle: string
  ctaText: string
  ctaHref: string
  product?: CommerceProduct & { selectedVariant?: any }
  variantOptions?: Record<string, string>
}

interface HomepageCarouselProps {
  slides: HeroSlide[]
  className?: string
}

export function HomepageCarousel({ slides = [], className }: HomepageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    skipSnaps: false,
    inViewThreshold: 0.7,
    watchDrag: true,
    watchResize: true,
    watchSlides: false,
  })

  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index)
    },
    [emblaApi]
  )

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)

    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  if (!slides || slides.length === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative bg-secondary/5", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Carrusel de productos destacados"
    >
      <div
        ref={emblaRef}
        className="overflow-hidden md:snap-x md:snap-mandatory md:scroll-smooth md:[-webkit-overflow-scrolling:touch] md:scrollbar-none md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden motion-safe:scroll-smooth"
      >
        <div className="flex">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative min-w-full flex-[0_0_100%] @container md:snap-start md:snap-always"
              role="group"
              aria-roledescription="slide"
              aria-label={`Diapositiva ${index + 1} de ${slides.length}`}
            >
              <div className="container mx-auto">
                <div className="relative min-h-[500px] px-4 py-12 sm:min-h-[550px] sm:py-16 md:min-h-[600px] lg:grid lg:min-h-[600px] lg:grid-cols-2 lg:items-center lg:gap-8 lg:py-20 xl:min-h-[700px] xl:gap-16">
                  <div className="absolute inset-0 -z-10 lg:hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background/95" />
                    <Image
                      src={slide.imageUrl}
                      alt=""
                      fill
                      className="size-full object-cover object-center opacity-30 blur-[2px] transition-all duration-700 sm:opacity-20 sm:blur-0"
                      priority={index === 0}
                      quality={40}
                      sizes="100vw"
                    />
                  </div>

                  <div className="relative flex flex-col justify-center space-y-6 text-center lg:px-4 lg:text-left">
                    <div className="space-y-4">
                      <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
                        {slide.title}
                      </h2>
                      <p className="mx-auto max-w-md text-balance text-base font-medium text-muted-foreground sm:text-lg lg:mx-0 lg:text-xl xl:text-2xl">
                        {slide.subtitle}
                      </p>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                      <Button size="lg" asChild className="w-full sm:w-auto lg:px-10 lg:py-7 lg:text-xl">
                        <Link href={slide.ctaHref}>{slide.ctaText}</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="w-full bg-background/50 backdrop-blur-sm sm:w-auto lg:px-10 lg:py-7 lg:text-xl"
                      >
                        <Link href="/search">Explorar Categorías</Link>
                      </Button>
                    </div>

                    {slide.product && (
                      <div className="mt-2 flex justify-center lg:hidden">
                        <CompactProductCard
                          product={slide.product}
                          selectedVariant={slide.product.selectedVariant}
                          variantOptions={slide.variantOptions}
                          priority={index === 0}
                          className="w-[180px] border-none bg-background/95 shadow-md hover:shadow-2xl ring-1 ring-black/5 backdrop-blur-md transition-all hover:scale-105 sm:w-[200px]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="relative mt-12 hidden lg:mt-0 lg:block lg:px-4">
                    <div className="relative h-[450px] w-full lg:h-[500px] xl:h-[600px]">
                      <Image
                        src={slide.imageUrl}
                        alt={slide.imageAlt}
                        width={800}
                        height={800}
                        className="size-full rounded-[2rem] object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-[1.01]"
                        priority={index === 0}
                        quality={90}
                        sizes="(min-width: 1024px) 45vw, 0vw"
                      />

                      {slide.product && (
                        <div className="absolute -bottom-4 -right-4 hidden w-[180px] md:block lg:-bottom-6 lg:-right-6 lg:w-[220px] xl:w-[240px]">
                          <CompactProductCard
                            product={slide.product}
                            selectedVariant={slide.product.selectedVariant}
                            variantOptions={slide.variantOptions}
                            priority={index === 0}
                            className="rotate-2 border-none bg-background/95 shadow-sm hover:shadow-2xl ring-1 ring-black/5 backdrop-blur-md transition-all duration-500 hover:rotate-0"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <div className="absolute inset-x-0 bottom-8 hidden lg:block">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        selectedIndex === index
                          ? "w-8 bg-foreground"
                          : "w-2 bg-foreground/30 hover:bg-foreground/50"
                      )}
                      onClick={() => scrollTo(index)}
                      aria-label={`Ir a la diapositiva ${index + 1}`}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur transition-all",
                      "hover:scale-110 hover:bg-background hover:shadow-md",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                    onClick={scrollPrev}
                    aria-label="Diapositiva anterior"
                  >
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur transition-all",
                      "hover:scale-110 hover:bg-background hover:shadow-md",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                    onClick={scrollNext}
                    aria-label="Diapositiva siguiente"
                  >
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-6 flex justify-center gap-3 lg:hidden">
            {slides.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "relative h-2.5 rounded-full transition-all duration-300",
                  "before:pointer-events-none before:absolute before:inset-[-8px] before:content-['']",
                  selectedIndex === index
                    ? "w-8 bg-foreground"
                    : "w-2.5 bg-foreground/40 active:bg-foreground/60"
                )}
                onClick={() => scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
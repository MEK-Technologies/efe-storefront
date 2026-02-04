"use client"

import { ProductCard } from "components/product-card"
import { CommerceProduct } from "types"
import { useEffect, useRef, useState } from "react"

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const ModernNewArrivalsSection = ({
  products,
}: {
  products: CommerceProduct[]
}) => {
  const [visibleProducts, setVisibleProducts] = useState<Set<number>>(new Set())
  const [shuffledProducts, setShuffledProducts] = useState<CommerceProduct[]>([])
  const productRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    setShuffledProducts(shuffleArray(products).slice(0, 8))
  }, [products])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    setVisibleProducts(new Set([0, 1, 2, 3]))

    productRefs.current.forEach((ref, index) => {
      if (ref && index >= 4) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setVisibleProducts((prev) => new Set(prev).add(index))
                observer.disconnect()
              }
            })
          },
          {
            rootMargin: "100px",
            threshold: 0.01,
          }
        )

        observer.observe(ref)
        observers.push(observer)
      }
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [shuffledProducts.length])

  if (products.length < 8) return null

  return (
    <section className="relative w-full py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {}
        <div className="mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Productos Destacados
          </h2>
          <p className="mt-2 text-base text-muted-foreground lg:text-lg"></p>
        </div>

        {}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {shuffledProducts.map((product, index) => (
            <div
              key={product.id}
              ref={(el) => {
                productRefs.current[index] = el
              }}
              className="group relative"
            >
              {visibleProducts.has(index) ? (
                <div className="relative overflow-hidden rounded-lg bg-secondary/5 transition-all duration-300 hover:bg-secondary/10">
                  <ProductCard
                    product={product}
                    prefetch={false}
                    priority={index < 4}
                    className="border-0 bg-transparent hover:bg-transparent"
                  />
                  {}
                  {index < 3 && (
                    <div className="absolute left-3 top-3 z-10">
                      <span className="inline-flex items-center rounded-full bg-foreground px-2 py-1 text-xs font-medium text-background">
                        DESTACADO
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[3/4] animate-pulse rounded-lg bg-gray-100" />
              )}
            </div>
          ))}
        </div>

        {}
        <div className="mt-12 text-center">
          <a
            href="/search?sort=created_at_desc"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 transition-all hover:underline"
          >
            Ver Todos Nuestros Productos Destacados
            <svg
              className="size-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

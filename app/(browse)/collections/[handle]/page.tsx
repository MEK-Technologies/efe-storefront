import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import { getPayloadClient } from "lib/payload-client"

interface CollectionPageProps {
  params: Promise<{ handle: string }>
}

export async function generateMetadata(props: CollectionPageProps): Promise<Metadata> {
  const params = await props.params
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: "collections",
    where: {
      handle: { equals: params.handle },
    },
    limit: 1,
    depth: 1,
  })

  const collection = docs?.[0] as any | undefined

  if (!collection) {
    return {}
  }

  return {
    title: collection.title || collection.handle,
    description: collection.metadata?.description || undefined,
  }
}

export default async function CollectionPage(props: CollectionPageProps) {
  const params = await props.params
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: "collections",
    where: {
      handle: { equals: params.handle },
    },
    limit: 1,
    depth: 2,
  })

  const collection = docs?.[0] as any | undefined

  if (!collection) {
    notFound()
  }

  const image = typeof collection.img_url === "object" ? collection.img_url : null
  const products = Array.isArray(collection.products) ? collection.products : []

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {collection.title || collection.handle}
          </h1>
          {collection.metadata?.description ? (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {collection.metadata.description}
            </p>
          ) : null}
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Back to home
        </Link>
      </div>

      {image?.url ? (
        <div className="mb-10 overflow-hidden rounded-lg border bg-secondary/20">
          <div className="relative aspect-[16/6] w-full">
            <Image
              src={image.url}
              alt={image.alt || collection.title || collection.handle}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        </div>
      ) : null}

      {products.length > 0 ? (
        <section className="mt-6">
          <h2 className="mb-4 text-lg font-semibold">Products in this collection</h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product: any) => (
              <li
                key={product.id}
                className="rounded-lg border bg-background p-4 text-sm"
              >
                <div className="font-medium">{product.title}</div>
                {product.minPrice ? (
                  <div className="mt-1 text-muted-foreground">
                    From {product.minPrice} {product.priceRange?.currencyCode || "USD"}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          No products have been assigned to this collection yet.
        </p>
      )}
    </div>
  )
}


import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import { getPayloadClient } from "lib/payload-client"
import { getProductsByCollectionId, getProductsBySearch } from "lib/medusa/data/product-queries"
import { ProductCard } from "components/product-card"

interface CollectionPageProps {
  params: Promise<{ handle: string }>
}

/**
 * Extract plain text from Lexical rich text structure
 */
function extractTextFromLexical(lexicalData: any): string {
  if (!lexicalData?.root?.children) return ""
  
  const extractText = (node: any): string => {
    if (!node) return ""
    
    // If node has text property, return it
    if (node.text) return node.text
    
    // If node has children, recursively extract text
    if (node.children && Array.isArray(node.children)) {
      return node.children.map(extractText).join(" ")
    }
    
    return ""
  }
  
  return lexicalData.root.children
    .map(extractText)
    .join(" ")
    .trim()
    .substring(0, 500) // Limit length
}

export async function generateMetadata(props: CollectionPageProps): Promise<Metadata> {
  const params = await props.params
  const payload = await getPayloadClient()

  // Decode the handle from URL (e.g., "Pods%20Desechables" -> "Pods Desechables")
  const decodedHandle = decodeURIComponent(params.handle)
  console.log('[Collections Metadata] Original handle:', params.handle)
  console.log('[Collections Metadata] Decoded handle:', decodedHandle)

  const { docs } = await payload.find({
    collection: "collections",
    where: {
      handle: { equals: decodedHandle },
    },
    limit: 1,
    depth: 1,
  })

  const collection = docs?.[0] as any | undefined

  if (!collection) {
    return {}
  }

  // Extract description from richText or metadata
  let description = collection.metadata?.description
  if (!description && collection.description) {
    // Extract plain text from Lexical structure
    description = extractTextFromLexical(collection.description)
  }

  return {
    title: `${collection.title || collection.handle} | Collections`,
    description: description || undefined,
  }
}

export default async function CollectionPage(props: CollectionPageProps) {
  const params = await props.params
  const payload = await getPayloadClient()

  // Decode the handle from URL (e.g., "Pods%20Desechables" -> "Pods Desechables")
  const decodedHandle = decodeURIComponent(params.handle)
  console.log('[Collections Page] Original handle:', params.handle)
  console.log('[Collections Page] Decoded handle:', decodedHandle)

  // Get collection from Payload
  const { docs } = await payload.find({
    collection: "collections",
    where: {
      handle: { equals: decodedHandle },
    },
    limit: 1,
    depth: 1, // No need for deep population since we'll fetch products from Medusa
  })

  const collection = docs?.[0] as any | undefined

  console.log('[Collections Page] Found collection:', collection ? collection.title : 'NOT FOUND')
  console.log('[Collections Page] Collection ID:', collection?.id)
  console.log('[Collections Page] Backend Collection ID:', collection?.backend_collection_id)
  console.log('[Collections Page] Collection data:', collection)

  if (!collection) {
    notFound()
  }

  // Get products from Medusa using backend_collection_id OR search by name
  let products: any[] = []
  
  // Strategy 1: Try exact match by collection ID if it exists
  if (collection.backend_collection_id) {
    console.log('[Collections Page] Fetching products for collection ID:', collection.backend_collection_id)
    products = await getProductsByCollectionId(collection.backend_collection_id, 24)
  } 
  
  // Strategy 2: If no products found via ID (or no ID), try partial name search
  // This matches the user request: "WHERE LOWER(p.title) LIKE '%mints%'"
  if (products.length === 0) {
    // Prefer title, fall back to handle. Ensure it's lowercase for fuzzy search.
    const rawQuery = collection.title || decodedHandle
    const searchQuery = rawQuery.trim() // Medusa q is case-insensitive, but cleaner to trim
    
    console.log(`[Collections Page] No products found by ID. Strategy 2: Search by name.`)
    console.log(`[Collections Page] Raw Query: "${rawQuery}", Search Query: "${searchQuery}"`)
    
    // Using the new search function
    if (searchQuery) {
      products = await getProductsBySearch(searchQuery, 100)
      console.log(`[Collections Page] Search for "${searchQuery}" found ${products.length} products`)
      
      // DEBUG: Log the first match titles to verify relevance
      if (products.length > 0) {
        console.log(`[Collections Page] First 3 matches:`, products.slice(0, 3).map(p => p.title))
      }
    } else {
      console.warn('[Collections Page] Search query is empty, skipping search.')
    }
  }

  if (products.length > 0) {
      console.log('[Collections Page] First product:', products[0])
  } else {
    console.log('[Collections Page] No backend_collection_id set and no search results found')
  }

  // Get banner image
  const bannerImage = typeof collection.banner_url === "object" ? collection.banner_url : null
  
  // Extract description text from Lexical
  const descriptionText = extractTextFromLexical(collection.description)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
      {/* Header Section */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            {collection.title || collection.handle}
          </h1>
          
          {descriptionText && (
            <p className="mt-4 max-w-3xl text-base text-muted-foreground leading-relaxed">
              {descriptionText}
            </p>
          )}
        </div>
        
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </Link>
      </div>

      {/* Banner Image */}
      {bannerImage?.url && (
        <div className="mb-12 overflow-hidden rounded-xl border bg-secondary/10 shadow-lg">
          <div className="relative aspect-[21/9] w-full">
            <Image
              src={bannerImage.url}
              alt={bannerImage.alt || collection.title || collection.handle}
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
            />
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold md:text-2xl">
              Products ({products.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={false}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No products found
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {collection.backend_collection_id 
              ? "This collection doesn't have any products yet." 
              : `No products found matching "${collection.title || decodedHandle}".`}
          </p>
        </div>
      )}
    </div>
  )
}


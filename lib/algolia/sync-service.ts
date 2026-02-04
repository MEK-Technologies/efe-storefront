
import { isDeepEqual, omit } from "remeda"
import { HIERARCHICAL_SEPARATOR } from "../../constants/index"
import { sdk } from "../medusa/config"
import { searchClient, writeClient } from "./client"
import { env } from "../../env.mjs"
import { ProductEnrichmentBuilder } from "../../utils/enrich-product"
import { isAlgoliaConfigured, logAlgoliaOperation, requireAlgolia, validateAlgoliaIndices } from "./config"

import { HttpTypes } from "@medusajs/types"

async function getAllProductsFromMedusa() {
  let allProducts: HttpTypes.StoreProduct[] = []
  let offset = 0
  const limit = 100
  
  while (true) {
    const { products, count } = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[], count: number }>(
      "/store/products",
      {
        query: {
          limit,
          offset,
          fields: "*variants.calculated_price,+variants.inventory_quantity,+variants.options,*variants.images,+metadata,+tags"
        }
      }
    )
    
    if (!products.length) break
    
    allProducts = [...allProducts, ...products]
    offset += limit
    
    // Safety check if we got fewer than limit, we are done
    if (products.length < limit) break
    if (allProducts.length >= count) break
  }
  
  return allProducts
}

async function getAllCategoriesFromMedusa() {
  let allCategories: HttpTypes.StoreProductCategory[] = []
  let offset = 0
  const limit = 100

  while (true) {
    const { product_categories, count } = await sdk.client.fetch<{ product_categories: HttpTypes.StoreProductCategory[], count: number }>(
      "/store/product-categories",
      {
        query: {
          limit,
          offset,
          fields: "+category_children"
        }
      }
    )

    if (!product_categories.length) break
    
    allCategories = [...allCategories, ...product_categories]
    offset += limit
    
    if (product_categories.length < limit) break
    if (allCategories.length >= count) break
  }

  return allCategories
}

export async function syncMedusaToAlgolia() {
  console.log("🚀 Starting sync process (Medusa -> Algolia)...")

  // Validate Algolia configuration first
  if (!isAlgoliaConfigured()) {
    console.error("❌ Algolia is not properly configured")
    console.log("Run 'npm run algolia:setup' to configure Algolia")
    throw new Error("Algolia configuration incomplete")
  }

  try {
    requireAlgolia("sync operation")
    validateAlgoliaIndices()
  } catch (error) {
    console.error("❌ Configuration error:", error)
    throw error
  }

  logAlgoliaOperation("Starting sync", {
    productsIndex: env.ALGOLIA_PRODUCTS_INDEX!,
    categoriesIndex: env.ALGOLIA_CATEGORIES_INDEX!,
  })

  const allProducts = await getAllProductsFromMedusa()
  console.log(`📦 Fetched ${allProducts.length} products from Medusa`)
  
  const allCategories = await getAllCategoriesFromMedusa()
  console.log(`📑 Fetched ${allCategories.length} categories from Medusa`)

  if (!allProducts.length && !allCategories.length) {
    console.warn("⚠️ No products or categories found, nothing to sync")
    return
  }

  const hierarchicalNavItems: any[] = [] 

  const enrichedProducts = await Promise.all(allProducts.map(async (product) => {
    const builder = new ProductEnrichmentBuilder(product)
      .withHierarchicalCategories(hierarchicalNavItems, HIERARCHICAL_SEPARATOR)
    
    await builder.withAltTags()
    return builder.build()
  }))

  const { hits: algoliaProducts } = await searchClient.getAllResults({
    indexName: env.ALGOLIA_PRODUCTS_INDEX!,
    browseParams: {},
  })

  const { hits: algoliaCategories } = await searchClient.getAllResults({
    indexName: env.ALGOLIA_CATEGORIES_INDEX!,
  })

  const deltaProducts = calculateDelta(enrichedProducts, algoliaProducts, (item) => item.id)
  const deltaCategories = calculateDelta(allCategories, algoliaCategories, (item: any) => item.id)

  console.log(`🔍 Delta - products: ${deltaProducts.length}, categories: ${deltaCategories.length}`)

  await updateAlgolia(env.ALGOLIA_PRODUCTS_INDEX!, deltaProducts)
  await updateAlgolia(env.ALGOLIA_CATEGORIES_INDEX!, deltaCategories)

  await deleteObsolete(
    env.ALGOLIA_PRODUCTS_INDEX!,
    allProducts.map((p) => p.id)
  )

  await deleteObsolete(
    env.ALGOLIA_CATEGORIES_INDEX!,
    allCategories.map((c) => c.id)
  )



  console.log("🎉 Sync completed successfully!")
}

async function updateAlgolia<T extends Record<string, any>>(indexName: string, docs: T[]) {
  if (!docs.length) return
  console.log(`📤 Updating ${docs.length} records in ${indexName}`)
  await writeClient.batchUpdate({
    indexName,
    batchWriteParams: {
      requests: docs.map((doc) => ({
        action: "partialUpdateObject",
        body: { ...doc, objectID: doc.id },
      })),
    },
  })
}

async function deleteObsolete(indexName: string, currentIds: string[]) {
  console.log(`🔍 Checking obsolete entries in ${indexName}`)
  const { hits } = await searchClient.getAllResults({
    indexName,
    browseParams: { attributesToRetrieve: ["objectID"] },
  })
  
  const existingIds = hits.map((h) => h.objectID)
  const toRemove = existingIds.filter((id) => !currentIds.includes(id))

  if (!toRemove.length) {
    console.log(`✨ No obsolete entries in ${indexName}`)
    return
  }

  console.log(`🗑️ Deleting ${toRemove.length} obsolete entries from ${indexName}`)
  
  await writeClient.batchUpdate({
    indexName,
    batchWriteParams: {
      requests: toRemove.map((id) => ({
        action: "deleteObject",
        body: { objectID: id },
      })),
    },
  })
}

function calculateDelta<T extends Record<string, any>>(source: T[], target: any[], idFn: (item: any) => string) {
  const map = new Map<string, any>(target.map((item) => [idFn(item), item]))
  return source.filter((item) => {
    const id = idFn(item)
    const existing = map.get(id)
    const normSource = omit({ ...item, objectID: id }, ["objectID"])
    const normExisting = existing ? omit(existing, ["objectID"]) : null
    
    return !existing || !isDeepEqual(normSource, normExisting)
  })
}

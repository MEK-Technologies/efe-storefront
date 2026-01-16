import { generateImageCaption } from "lib/replicate"
import { isOptIn } from "./opt-in"

import { HttpTypes } from "@medusajs/types"
import { CommerceProduct } from "types"


// Type for navigation items (categories converted for menu)
interface NavItem {
  id?: string
  title: string
  resource?: { handle: string } | null
  items?: NavItem[]
}

export class ProductEnrichmentBuilder {
  private product: CommerceProduct

  constructor(baseProduct: HttpTypes.StoreProduct) {
    this.product = baseProduct as CommerceProduct
  }

  withHierarchicalCategories(collections: NavItem[], separator: string): this {
    const categoryMap = buildCategoryMap(collections)

    if (!categoryMap.size) {
      return this
    }

    // Use product tags for hierarchical category mapping
    const tags = this.product.tags?.map(t => t.value) ?? []

    this.product = {
      ...this.product,
      hierarchicalCategories: generateHierarchicalCategories(tags, categoryMap, separator),
    } as CommerceProduct

    return this
  }



  async withAltTags(): Promise<this> {
    if (!isOptIn("altTags")) {
      return this
    }

    try {
      const images = await generateProductAltTags(this.product)
      this.product = {
        ...this.product,
        images: images.filter(Boolean),
      } as CommerceProduct
    } catch (e) {}
    return this
  }

  build(): CommerceProduct {
    return this.product
  }
}

async function generateProductAltTags(
  product: HttpTypes.StoreProduct
): Promise<(HttpTypes.StoreProductImage | undefined)[]> {
  try {
    const images = product.images ?? []
    const altTagAwareImages = await Promise.all(images.slice(0, 1).map(mapper).filter(Boolean))
    return [...altTagAwareImages, ...images.slice(1).filter(Boolean)] || []
  } catch (e) {
    return product.images ?? []
  }
}

async function mapper(image: HttpTypes.StoreProductImage) {
  const output = await generateImageCaption(image.url)
  // Note: Medusa's StoreProductImage doesn't have an altText field,
  // but we add it for Algolia indexing purposes
  return { ...image, altText: output?.replace("Caption:", "") || "" }
}

export function buildCategoryMap(items: NavItem[]): Map<string, string[]> {
  const categoryMap = new Map<string, string[]>()

  const traverse = (items: NavItem[], path: string[]) => {
    for (const item of items) {
      const newPath = [...path, item.resource?.handle || ""]
      categoryMap.set(item.resource?.handle || "", newPath)
      if (item.items && item.items.length > 0) {
        traverse(item.items, newPath)
      }
    }
  }

  traverse(items, [])
  return categoryMap
}

export function generateHierarchicalCategories(
  tags: string[],
  categoryMap: Map<string, string[]>,
  separator: string = " > "
) {
  const hierarchicalCategories: { lvl0: string[]; lvl1: string[]; lvl2: string[] } = { lvl0: [], lvl1: [], lvl2: [] }

  tags.forEach((tag) => {
    const path = categoryMap.get(tag)
    if (path) {
      if (path.length > 0 && !hierarchicalCategories.lvl0.includes(path[0])) {
        hierarchicalCategories.lvl0.push(path[0])
      }
      if (path.length > 1) {
        const lvl1Path = path.slice(0, 2).join(separator)
        if (!hierarchicalCategories.lvl1.includes(lvl1Path)) {
          hierarchicalCategories.lvl1.push(lvl1Path)
        }
      }
      if (path.length > 2) {
        const lvl2Path = path.slice(0, 3).join(separator)
        if (!hierarchicalCategories.lvl2.includes(lvl2Path)) {
          hierarchicalCategories.lvl2.push(lvl2Path)
        }
      }
    }
  })

  return hierarchicalCategories
}

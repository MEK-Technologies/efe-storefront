import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"
import { sdk } from "../config"
import { decodeHandle } from "utils/slugify"

export const listCategories = async (query?: Record<string, unknown>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit,
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

/**
 * Fetch root categories (top-level, no parent) with their full descendant tree.
 * Used for mega menu navigation.
 */
export const listRootCategories = async (limit: number = 5) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields: "*category_children",
          parent_category_id: "null",
          include_descendants_tree: true,
          limit,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  // Decode the handle in case it comes URL-encoded from the route
  const decodedHandle = categoryHandle.map(h => decodeHandle(h)).join("/")
  
  const next = {
    ...(await getCacheOptions("categories")),
  }

  // First try with the decoded handle
  let result = await sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products",
          handle: decodedHandle,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories[0])

  // If not found and handle looks like a slug, try to find by matching slugified handles
  if (!result && !decodedHandle.includes(" ")) {
    // Fetch all categories and find by matching slugified handle
    const allCategories = await listCategories({ limit: 1000 })
    const { slugify } = await import("utils/slugify")
    
    result = allCategories.find(cat => slugify(cat.handle) === decodedHandle)
  }

  return result
}

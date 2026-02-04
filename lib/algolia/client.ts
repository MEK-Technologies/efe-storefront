import {
  algoliasearch,
  type BatchProps,
  type BrowseProps,
  type DeleteObjectsOptions,
  type GetRecommendationsParams,
  type PartialUpdateObjectsOptions,
  type SearchForFacetValuesProps,
  type SearchMethodParams,
  type SearchResponse,
  type SearchSingleIndexProps,
} from "algoliasearch"

import { env } from "../../env.mjs"
import { logAlgoliaOperation, requireAlgolia } from "./config"

import { FilterBuilder } from "./filter-builder"

const algoliaClient = (args: { applicationId: string; apiKey: string }) => {
  return algoliasearch(args.applicationId, args.apiKey)
}

export const algolia = (args: { applicationId: string; apiKey: string }) => {
  const client = algoliaClient(args)
  const recommendationClient = client.initRecommend()

  return {
    search: async <T extends Record<string, any>>(args: SearchSingleIndexProps) => search<T>(args, client),
    getAllResults: async <T extends Record<string, any>>(args: BrowseProps) => getAllResults<T>(client, args),
    update: async (args: PartialUpdateObjectsOptions) => {
      const transformedArgs = {
        ...args,
        objects: args.objects.map((obj) => ({
          ...obj,
          objectID: obj.objectID || obj.id?.toString() || obj.id,
        })),
      }
      return updateObjects(transformedArgs, client)
    },
    batchUpdate: async (args: BatchProps) => batchUpdate(args, client),
    delete: async (args: DeleteObjectsOptions) => deleteObjects(args, client),
    create: async (args: PartialUpdateObjectsOptions) => createObjects(args, client),
    multiSearch: async <T extends Record<string, any>>(args: SearchMethodParams) => multiSearch<T>(args, client),
    getRecommendations: async (args: GetRecommendationsParams) => getRecommendations(recommendationClient, args),
    getFacetValues: async (args: SearchForFacetValuesProps) => getFacetValues(client, args),
    filterBuilder: () => new FilterBuilder(),
    mapIndexToSort,
  }
}

const search = async <T extends Record<string, any>>(
  args: SearchSingleIndexProps,
  client: ReturnType<typeof algoliaClient>
) => {
  return client.searchSingleIndex<T>(args)
}

const getAllResults = async <T extends Record<string, any>>(
  client: ReturnType<typeof algoliaClient>,
  args: BrowseProps
) => {
  const allHits: T[] = []
  let totalPages: number
  let cursor: string | undefined

  do {
    const {
      hits,
      nbPages,
      cursor: nextCursor,
    } = await client.browse<T>({
      ...args,
      browseParams: {
        ...args.browseParams,
        hitsPerPage: 1000,
        cursor,
      },
    })
    allHits.push(...hits)
    totalPages = nbPages || 0
    cursor = nextCursor
  } while (cursor)

  return { hits: allHits, totalPages }
}

const batchUpdate = async (args: BatchProps, client: ReturnType<typeof algoliaClient>) => {
  return client.batch(args)
}

const updateObjects = async (args: PartialUpdateObjectsOptions, client: ReturnType<typeof algoliaClient>) => {
  return client.partialUpdateObjects(args)
}

const deleteObjects = async (args: DeleteObjectsOptions, client: ReturnType<typeof algoliaClient>) => {
  return client.deleteObjects(args)
}

const createObjects = async (args: PartialUpdateObjectsOptions, client: ReturnType<typeof algoliaClient>) => {
  return client.partialUpdateObjects({
    ...args,
    createIfNotExists: true,
  })
}

const multiSearch = async <T extends Record<string, any>>(
  args: SearchMethodParams,
  client: ReturnType<typeof algoliaClient>
) => {
  return client.search<T>(args) as Promise<{ results: SearchResponse<T>[] }>
}

const getRecommendations = async (
  client: ReturnType<ReturnType<typeof algoliaClient>["initRecommend"]>,
  args: GetRecommendationsParams
) => {
  return client.getRecommendations(args)
}

const getFacetValues = async (client: ReturnType<typeof algoliaClient>, args: SearchForFacetValuesProps) => {
  return client.searchForFacetValues(args)
}
export type SortType =
  | "minPrice:desc"
  | "minPrice:asc"
  | "avgRating:desc"
  | "updatedAtTimestamp:asc"
  | "updatedAtTimestamp:desc"

const mapIndexToSort = (index: string, sortOption: SortType) => {
  switch (sortOption) {
    case "minPrice:desc":
      return `${index}_price_desc`
    case "minPrice:asc":
      return `${index}_price_asc`
    case "avgRating:desc":
      return `${index}_rating_desc`
    case "updatedAtTimestamp:asc":
      return `${index}_updated_asc`
    case "updatedAtTimestamp:desc":
      return `${index}_updated_desc`

    default:
      return index
  }
}

// Cliente de lectura (usa Search API Key - seguro para exponer al cliente)
export const searchClient: ReturnType<typeof algolia> = (() => {
  try {
    requireAlgolia("searchClient initialization")
    
    // Priorizar SEARCH_API_KEY para operaciones de lectura (más seguro)
    const apiKey = env.ALGOLIA_SEARCH_API_KEY || env.ALGOLIA_WRITE_API_KEY || ""
    
    logAlgoliaOperation("Initializing Algolia search client", {
      appId: env.ALGOLIA_APP_ID,
      hasSearchKey: !!env.ALGOLIA_SEARCH_API_KEY,
      hasWriteKey: !!env.ALGOLIA_WRITE_API_KEY,
      usingSearchKey: !!env.ALGOLIA_SEARCH_API_KEY,
    })
    
    if (!env.ALGOLIA_SEARCH_API_KEY) {
      console.warn(
        "[Algolia] ⚠️ ALGOLIA_SEARCH_API_KEY not configured. " +
        "Using WRITE_API_KEY which is less secure. " +
        "Consider creating a Search-Only API key in Algolia dashboard."
      )
    }
    
    return algolia({
      applicationId: env.ALGOLIA_APP_ID || "",
      apiKey,
    })
  } catch (error) {
    console.error("[Algolia] Configuration error:", error)
    
    // Return a mock client that throws errors on usage
    return {
      search: async () => { throw new Error("Algolia not configured") },
      getAllResults: async () => { throw new Error("Algolia not configured") },
      update: async () => { throw new Error("Algolia not configured") },
      batchUpdate: async () => { throw new Error("Algolia not configured") },
      delete: async () => { throw new Error("Algolia not configured") },
      create: async () => { throw new Error("Algolia not configured") },
      multiSearch: async () => { throw new Error("Algolia not configured") },
      getRecommendations: async () => { throw new Error("Algolia not configured") },
      getFacetValues: async () => { throw new Error("Algolia not configured") },
      filterBuilder: () => new FilterBuilder(),
      mapIndexToSort: (index: string, _sortOption: any) => index,
    } as any
  }
})()

// Cliente de escritura (usa Write API Key - solo para operaciones de servidor)
export const writeClient: ReturnType<typeof algolia> = (() => {
  try {
    requireAlgolia("writeClient initialization")
    
    logAlgoliaOperation("Initializing Algolia write client", {
      appId: env.ALGOLIA_APP_ID,
      hasWriteKey: !!env.ALGOLIA_WRITE_API_KEY,
    })
    
    return algolia({
      applicationId: env.ALGOLIA_APP_ID || "",
      apiKey: env.ALGOLIA_WRITE_API_KEY || "",
    })
  } catch (error) {
    console.error("[Algolia] Write client configuration error:", error)
    throw error
  }
})()

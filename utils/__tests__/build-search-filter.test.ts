import { buildSearchFilter } from "../build-search-filter"
import { HttpTypes } from "@medusajs/types"

describe("buildSearchFilter", () => {
  const defaultParams = {
    categories: [],
    vendors: [],
    colors: [],
    minPrice: undefined,
    maxPrice: undefined,
    rating: undefined,
  }

  const separator = " > "

  it("should return empty string when no filters are applied", () => {
    const result = buildSearchFilter({
      params: defaultParams,
      separator,
    })

    expect(result).toBe("")
  })

  it("should filter by collection when provided", () => {
    const collection: HttpTypes.StoreProductCategory = {
      handle: "test-collection",
      id: "123",
      name: "Test Collection",
      description: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as HttpTypes.StoreProductCategory

    const result = buildSearchFilter({
      collection,
      params: defaultParams,
      separator,
    })

    expect(result).toBe('collections.handle:"test-collection"')
  })

  it("should filter by categories", () => {
    const params = {
      ...defaultParams,
      categories: ["Category1", "Category1 > Subcategory", "Category2 > Sub > SubSub"],
    }

    const result = buildSearchFilter({ params, separator })

    expect(result).toBe(
      '(hierarchicalCategories.lvl0:"Category1" AND hierarchicalCategories.lvl1:"Category1 > Subcategory" AND hierarchicalCategories.lvl2:"Category2 > Sub > SubSub")'
    )
  })

  it("should filter by vendors", () => {
    const params = {
      ...defaultParams,
      vendors: ["Vendor1", "Vendor2"],
    }

    const result = buildSearchFilter({ params, separator })

    expect(result).toBe('(vendor:"Vendor1" OR vendor:"Vendor2")')
  })

  it("should filter by colors", () => {
    const params = {
      ...defaultParams,
      colors: ["Red", "Blue"],
    }

    const result = buildSearchFilter({ params, separator })

    expect(result).toBe('(flatOptions.Color:"Red" OR flatOptions.Color:"Blue")')
  })

  it("should filter by price range", () => {
    const params = {
      ...defaultParams,
      minPrice: 10,
      maxPrice: 100,
    }

    const result = buildSearchFilter({ params, separator })

    expect(result).toBe("minPrice >= 10 AND minPrice <= 100")
  })

  it("should filter by minimum price only", () => {
    const params = {
      ...defaultParams,
      minPrice: 10,
    }

    const result = buildSearchFilter({ params, separator })

    expect(result).toBe("minPrice >= 10")
  })

  it("should filter by maximum price only", () => {
    const params = {
      ...defaultParams,
      maxPrice: 100,
    }

    const result = buildSearchFilter({ params, separator })

    expect(result).toBe("minPrice <= 100")
  })

  it("should filter by rating", () => {
    const params = {
      ...defaultParams,
      rating: 4,
    }

    const result = buildSearchFilter({ params, separator })

    expect(result).toBe("avgRating >= 4")
  })

  it("should ignore rating when it's 0 or negative", () => {
    const params = {
      ...defaultParams,
      rating: 0,
    }

    const result = buildSearchFilter({ params, separator })

    expect(result).toBe("")
  })

  it("should combine multiple filters with AND operator", () => {
    const collection: HttpTypes.StoreProductCategory = {
      handle: "test-collection",
      id: "123",
      name: "Test Collection",
      description: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as HttpTypes.StoreProductCategory

    const params = {
      ...defaultParams,
      vendors: ["Vendor1"],
      rating: 4,
      minPrice: 10,
      maxPrice: 100,
    }

    const result = buildSearchFilter({
      collection,
      params,
      separator,
    })

    expect(result).toBe(
      'collections.handle:"test-collection" AND (vendor:"Vendor1") AND minPrice >= 10 AND minPrice <= 100 AND avgRating >= 4'
    )
  })
})

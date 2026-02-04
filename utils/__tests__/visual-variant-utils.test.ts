import { describe, expect, test } from "@jest/globals"
import {
  createMultiOptionSlug,
  createVisualOptionSlug,
  filterImagesByVisualOption,
  getAllOptionValuesFromCombination,
  getCombinationByMultiOption,
  getCombinationByVisualOption,
  getImagesForCarousel,
  getMultiOptionFromSlug,
  getVisualOptionFromSlug,
  getVisualOptionValueFromCombination,
  hasValidMultiOption,
  hasValidVisualOption,
  removeMultiOptionFromSlug,
  removeVisualOptionFromSlug,
} from "../visual-variant-utils"
import { HttpTypes } from "@medusajs/types"

// Helper to create mock variants with Medusa structure
const createMockVariant = (
  id: string,
  title: string,
  options: Record<string, string>
): HttpTypes.StoreProductVariant => {
  return {
    id,
    title,
    options: Object.entries(options).map(([key, value]) => ({
      id: `opt_${key}_${value}`,
      value: value,
      option: {
        id: `opt_def_${key}`,
        title: key,
        product_id: "prod_1",
      },
      variant_id: id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    })),
    prices: [],
    // Add other required properties with mock values if strict typing requires
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    product_id: "prod_1",
    product: undefined,
  } as unknown as HttpTypes.StoreProductVariant
}

describe("Visual Variant Utils", () => {
  describe("URL handling", () => {
    test("should extract visual option from slug", () => {
      expect(getVisualOptionFromSlug("sunrise-silk-shampoo-conditioner-set-color_red")).toBe("red")
      expect(getVisualOptionFromSlug("my-shirt-color_blue")).toBe("blue")
      expect(getVisualOptionFromSlug("simple-product")).toBe(null)
    })

    test("should remove visual option from slug", () => {
      expect(removeVisualOptionFromSlug("sunrise-silk-shampoo-conditioner-set-color_red")).toBe(
        "sunrise-silk-shampoo-conditioner-set"
      )
      expect(removeVisualOptionFromSlug("my-shirt-color_blue")).toBe("my-shirt")
      expect(removeVisualOptionFromSlug("simple-product")).toBe("simple-product")
    })

    test("should create visual option slug", () => {
      expect(createVisualOptionSlug("my-shirt", "blue")).toBe("my-shirt-color_blue")
      expect(createVisualOptionSlug("my-shirt-color_red", "blue")).toBe("my-shirt-color_blue")
      expect(createVisualOptionSlug("my-shirt", undefined)).toBe("my-shirt")
    })
  })

  describe("Multi-option URL handling", () => {
    test("should remove multi-option from slug", () => {
      expect(removeMultiOptionFromSlug("my-shirt--color_blue-size_large-material_cotton")).toBe("my-shirt")
      expect(removeMultiOptionFromSlug("extremecore-ab-roller--color_purple-type_gym-prousage_advanced")).toBe(
        "extremecore-ab-roller"
      )
      expect(removeMultiOptionFromSlug("simple-product")).toBe("simple-product")
    })

    test("should extract multi-option from slug", () => {
      expect(getMultiOptionFromSlug("my-shirt--color_blue-size_large")).toEqual({
        color: "blue",
        size: "large",
      })
      expect(getMultiOptionFromSlug("extremecore-ab-roller--color_purple-type_gym-prousage_advanced")).toEqual({
        color: "purple",
        type: "gym",
        prousage: "advanced",
      })
      expect(getMultiOptionFromSlug("simple-product")).toEqual({})
    })

    test("should create multi-option slug", () => {
      expect(createMultiOptionSlug("my-shirt", { color: "blue", size: "large" })).toBe(
        "my-shirt--color_blue-size_large"
      )
      expect(createMultiOptionSlug("ab-roller", { Color: "Purple", Type: "Gym", "Pro Usage": "Advanced" })).toBe(
        "ab-roller--color_purple-prousage_advanced-type_gym"
      )
      expect(createMultiOptionSlug("simple-product", {})).toBe("simple-product")
    })

    test("should handle option names and values with spaces", () => {
      expect(createMultiOptionSlug("product", { "Pro Usage": "Very Advanced", "Size Category": "Large Size" })).toBe(
        "product--prousage_veryadvanced-sizecategory_largesize"
      )
    })
  })

  describe("Image filtering", () => {
    const mockImages = [
      { id: "1", url: "product-image-1.jpg" },
      { id: "2", url: "product-Color-Red-image.jpg" },
      { id: "3", url: "product-Color-Blue-image.jpg" },
    ] as HttpTypes.StoreProductImage[]

    test("should filter images by visual option", () => {
      expect(filterImagesByVisualOption(mockImages, "red", "Color")).toEqual([{ id: "2", url: "product-Color-Red-image.jpg" }])
      expect(filterImagesByVisualOption(mockImages, "blue")).toEqual([{ id: "3", url: "product-Color-Blue-image.jpg" }])
    })

    test("should return all images if no match found", () => {
      expect(filterImagesByVisualOption(mockImages, "green")).toEqual(mockImages)
    })

    test("should return all images if no visual value provided", () => {
      expect(filterImagesByVisualOption(mockImages, null)).toEqual(mockImages)
    })

    test("should get images for carousel with active index", () => {
      expect(getImagesForCarousel(mockImages, "red")).toEqual({
        images: mockImages,
        activeIndex: 1,
      })
      expect(getImagesForCarousel(mockImages, "blue")).toEqual({
        images: mockImages,
        activeIndex: 2,
      })
      expect(getImagesForCarousel(mockImages, null)).toEqual({
        images: mockImages,
        activeIndex: 0,
      })
    })
  })

  describe("Combination handling", () => {
    const mockVariants = [
      createMockVariant("1", "Red", { Color: "Red" }),
      createMockVariant("2", "Blue", { Color: "Blue" }),
      createMockVariant("3", "Purple Gym Advanced", { Color: "Purple", Type: "Gym", "Pro Usage": "Advanced" })
    ]

    test("should get visual option value from combination", () => {
      expect(getVisualOptionValueFromCombination(mockVariants[0])).toBe("Red")
      expect(getVisualOptionValueFromCombination(mockVariants[1])).toBe("Blue")
    })

    test("should get all option values from combination", () => {
      expect(
        getAllOptionValuesFromCombination(createMockVariant("1", "Red Large", { Color: "Red", Size: "Large" }))
      ).toEqual({
        color: "red",
        size: "large",
      })

      expect(
        getAllOptionValuesFromCombination(createMockVariant("2", "Purple Large", { Color: "Purple", Size: "Large" }))
      ).toEqual({
        color: "purple",
        size: "large",
      })
    })

    test("should get combination by visual option", () => {
      const redCombination = getCombinationByVisualOption(mockVariants, "red")
      expect(redCombination?.id).toBe("1")

      const blueCombination = getCombinationByVisualOption(mockVariants, "blue")
      expect(blueCombination?.id).toBe("2")
    })

    test("should get combination by multi-option with slugified names", () => {
      const purpleCombination = getCombinationByMultiOption(mockVariants, {
        color: "purple",
        type: "gym",
        prousage: "advanced",
      })
      expect(purpleCombination?.id).toBe("3")

      const redCombination = getCombinationByMultiOption(mockVariants, { color: "red" })
      expect(redCombination?.id).toBe("1")
    })

    test("should validate visual options", () => {
      expect(hasValidVisualOption(mockVariants, "red")).toBe(true)
      expect(hasValidVisualOption(mockVariants, "blue")).toBe(true)
      expect(hasValidVisualOption(mockVariants, "yellow")).toBe(false)
      expect(hasValidVisualOption(mockVariants, null)).toBe(true)
    })

    test("should validate multi-options with slugified names", () => {
      expect(hasValidMultiOption(mockVariants, { color: "purple", type: "gym", prousage: "advanced" })).toBe(true)
      expect(hasValidMultiOption(mockVariants, { color: "red" })).toBe(true)
      expect(hasValidMultiOption(mockVariants, { color: "yellow" })).toBe(false)
      expect(hasValidMultiOption(mockVariants, {})).toBe(true)
    })
  })
})

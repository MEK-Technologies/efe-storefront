import { HttpTypes } from "@medusajs/types"
import type { CommerceProduct } from "types"
import type { Combination } from "utils/product-options-utils"
import { create } from "zustand"

interface AddProductStore {
  product: CommerceProduct | null
  combination: Combination | HttpTypes.StoreProductVariant | null
  setProduct: ({
    product,
    combination,
  }: {
    product: CommerceProduct
    combination: Combination | HttpTypes.StoreProductVariant
  }) => void
  clean: () => void
}

export const useAddProductStore = create<AddProductStore>()((set) => ({
  product: null,
  combination: null,
  setProduct: ({ product, combination }) => set(() => ({ product, combination })),
  clean: () => set(() => ({ product: null, combination: null })),
}))

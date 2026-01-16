import { HttpTypes } from "@medusajs/types"
import { create } from "zustand"

export interface CartStore {
  isOpen: boolean
  isSheetLoaded: boolean
  lastUpdatedAt: number
  cart: HttpTypes.StoreCart | null
  checkoutReady: boolean

  openCart: () => void
  closeCart: () => void
  preloadSheet: () => void
  refresh: () => void
  setCart: (payload: HttpTypes.StoreCart | null) => void
  setCheckoutReady: (payload: boolean) => void
}

export const useCartStore = create<CartStore>()((set) => ({
  isOpen: false,
  lastUpdatedAt: 0,
  cart: null,
  isSheetLoaded: false,
  checkoutReady: true,

  openCart: () => set(() => ({ isOpen: true, isSheetLoaded: true, lastUpdatedAt: Date.now() })),
  closeCart: () => set(() => ({ isOpen: false, isSheetLoaded: true, lastUpdatedAt: Date.now() })),
  preloadSheet: () => set(() => ({ isSheetLoaded: true })),
  refresh: () => set(() => ({ lastUpdatedAt: Date.now() })),
  setCheckoutReady: (payload: boolean) => set(() => ({ checkoutReady: payload })),
  setCart: (payload: HttpTypes.StoreCart | null) => set(() => ({ cart: payload })),
}))

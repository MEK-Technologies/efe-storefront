"use client"

import { useEffect, useTransition } from "react"
import dynamic from "next/dynamic"
import { getCart } from "app/actions/cart.actions"
import { useCartStore } from "stores/cart-store"

const CartSheet = dynamic(() => import("components/cart/cart-sheet").then((mod) => mod.CartSheet))

/**
 * CartView component handles cart state synchronization.
 * 
 * LAZY INITIALIZATION FLOW:
 * 1. Initial mount: getCart() returns null (no cart exists yet)
 * 2. User adds first item: addCartItem() creates cart and sets cookie
 * 3. refresh() triggers: getCart() now finds the cart
 * 4. Cart displays with items
 */
export function CartView() {
  const [isPending, startTransition] = useTransition()

  const isOpen = useCartStore((s) => s.isOpen)
  const isSheetLoaded = useCartStore((s) => s.isSheetLoaded)
  const openCart = useCartStore((s) => s.openCart)
  const closeCart = useCartStore((s) => s.closeCart)
  const setCart = useCartStore((s) => s.setCart)
  const cart = useCartStore((s) => s.cart)
  const lastUpdatedAt = useCartStore((s) => s.lastUpdatedAt)

  // Sync cart state from backend whenever it's updated
  // lastUpdatedAt changes when: items added/removed, quantities changed, checkout completed
  useEffect(() => {
    startTransition(async () => {
      const { cart } = await getCart()
      setCart(cart || null)
    })
  }, [lastUpdatedAt, setCart])

  return (
    isSheetLoaded && (
      <CartSheet isPending={isPending} isOpen={isOpen} onCartOpen={openCart} cart={cart!} onCartClose={closeCart} />
    )
  )
}

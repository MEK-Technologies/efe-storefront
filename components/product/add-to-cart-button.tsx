"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { HttpTypes } from "@medusajs/types"

import { addCartItem, getItemAvailability } from "app/actions/cart.actions"

import { Button } from "components/ui/button"
import { BagIcon } from "components/icons/bag-icon"

import { cn } from "utils/cn"
import { getCookie } from "utils/get-cookie"
import type { Combination } from "utils/product-options-utils"

import { useAddProductStore } from "stores/add-product-store"
import { useCartStore } from "stores/cart-store"

import type { CommerceProduct } from "types"

import { COOKIE_CART_ID } from "constants/index"

export function AddToCartButton({
  className,
  product,
  combination,
  countryCode,
}: {
  className?: string
  product: CommerceProduct
  combination: Combination | HttpTypes.StoreProductVariant | undefined
  countryCode: string
}) {
  const [isPending, setIsPending] = useState(false)
  const [isAvailable, setIsAvailable] = useState(true)
  const setProduct = useAddProductStore((s) => s.setProduct)
  const clean = useAddProductStore((s) => s.clean)
  const cart = useCartStore((s) => s.cart)
  const refresh = useCartStore((s) => s.refresh)
  const setCheckoutReady = useCartStore((s) => s.setCheckoutReady)

  const disabled = !isAvailable || isPending

  const handleClick = async () => {
    console.log("[AddToCartButton] handleClick started")
    
    if (!combination?.id) {
      console.warn("[AddToCartButton] No combination.id in handleClick")
      return
    }

    setIsPending(true)
    setCheckoutReady(false)

    try {
      console.log("[AddToCartButton] Calling addCartItem...")
      const res = await addCartItem(null, combination.id, product.id, countryCode)
      
      console.log("[AddToCartButton] addCartItem result:", res)

      if (!res.ok) {
        console.warn("[AddToCartButton] addCartItem failed:", res.message)
        toast.error(res.message || "Out of stock")
      } else {
        console.log("[AddToCartButton] Successfully added to cart")
        // Show product added animation
        setProduct({ product, combination })
        setTimeout(() => clean(), 4500)
      }
    } catch (error) {
      console.error("[AddToCartButton] Error in handleClick:", error)
      toast.error("Error adding to cart")
    } finally {
      // Reset states after operation completes
      setTimeout(() => setIsPending(false), 300)
      setCheckoutReady(true)
      refresh()
    }
  }

  useEffect(() => {
    const checkStock = async () => {
      console.log("[AddToCartButton] checkStock started:", {
        hasCombo: !!combination,
        comboId: combination?.id,
        productId: product.id
      })
      
      if (!combination?.id) {
        console.warn("[AddToCartButton] No combination.id, marking as unavailable")
        setIsAvailable(false)
        return
      }

      const cartId = getCookie(COOKIE_CART_ID)
      console.log("[AddToCartButton] CartId from cookie:", cartId)
      
      const itemAvailability = await getItemAvailability({
        cartId,
        productId: product.id,
        variantId: combination.id,
      })

      console.log("[AddToCartButton] Item availability:", itemAvailability)

      // If inStockQuantity is Infinity (not managing inventory), always available
      if (itemAvailability.inStockQuantity === Number.POSITIVE_INFINITY) {
        console.log("[AddToCartButton] Unlimited stock (Infinity)")
        setIsAvailable(true)
        return
      }

      // Otherwise check if there's stock and we can add more
      const hasStock = itemAvailability.inStockQuantity > 0
      const canAddMore = itemAvailability.inCartQuantity < itemAvailability.inStockQuantity
      const isAvailable = hasStock && canAddMore
      
      console.log("[AddToCartButton] Stock check:", {
        hasStock,
        canAddMore,
        isAvailable,
        inCart: itemAvailability.inCartQuantity,
        inStock: itemAvailability.inStockQuantity
      })
      
      setIsAvailable(isAvailable)
    }

    checkStock()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combination?.id, product.id, cart?.items?.length])

  return (
    <Button
      onClick={handleClick}
      disabled={isPending || disabled}
      variant="default"
      className={cn(
        "mx-auto w-full rounded-md p-10 py-4 transition-all hover:bg-black/85 md:w-full md:rounded-md md:py-4",
        className
      )}
    >
      <BagIcon className="mr-2 size-5 text-white" />
      Add to Bag
    </Button>
  )
}

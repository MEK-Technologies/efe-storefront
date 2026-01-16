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

// Helper to check if combination is a Combination type (has availableForSale)
function isCombination(combo: Combination | HttpTypes.StoreProductVariant | undefined): combo is Combination {
  return combo !== undefined && 'availableForSale' in combo
}

// Helper to get availability status
function getAvailability(combo: Combination | HttpTypes.StoreProductVariant | undefined): boolean {
  if (!combo) return false
  if (isCombination(combo)) {
    return combo.availableForSale
  }
  // For StoreProductVariant, check inventory
  if (combo.manage_inventory && combo.inventory_quantity != null) {
    return combo.inventory_quantity > 0
  }
  return true // If not managing inventory, assume available
}

// Helper to get quantity available
function getQuantityAvailable(combo: Combination | HttpTypes.StoreProductVariant | undefined): number {
  if (!combo) return 0
  if (isCombination(combo)) {
    return combo.quantityAvailable ?? 0
  }
  return combo.inventory_quantity ?? 0
}

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
  const [hasAnyAvailable, setHasAnyAvailable] = useState(true)
  const setProduct = useAddProductStore((s) => s.setProduct)
  const clean = useAddProductStore((s) => s.clean)
  const cart = useCartStore((s) => s.cart)
  const refresh = useCartStore((s) => s.refresh)
  const setCheckoutReady = useCartStore((s) => s.setCheckoutReady)

  const isAvailable = getAvailability(combination)
  const disabled = !hasAnyAvailable || !isAvailable || isPending

  const handleClick = async () => {
    if (!combination?.id) return

    setIsPending(true)

    setTimeout(() => {
      setProduct({ product, combination })
      setIsPending(false)
    }, 300)

    setTimeout(() => clean(), 4500)

    setCheckoutReady(false)
    const res = await addCartItem(null, combination.id, product.id, countryCode)

    if (!res.ok) toast.error("Out of stock")

    setCheckoutReady(true)
    refresh()
  }

  const quantityAvailable = getQuantityAvailable(combination)

  useEffect(() => {
    const checkStock = async () => {
      const cartId = getCookie(COOKIE_CART_ID)
      const itemAvailability = await getItemAvailability({
        cartId,
        productId: product.id,
        variantId: combination?.id,
      })

      itemAvailability && setHasAnyAvailable(itemAvailability.inCartQuantity < quantityAvailable)
    }

    checkStock()
  }, [combination?.id, isPending, quantityAvailable, cart?.items, product.id])

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

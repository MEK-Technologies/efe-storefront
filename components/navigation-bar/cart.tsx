"use client"

import { cn } from "utils/cn"
import { OpenCartButton } from "./open-cart-button"
import { useCartStore } from "stores/cart-store"
import { BagIcon } from "components/icons/bag-icon"
import { useMemo } from "react"

interface CartProps {
  className?: string
}

export function Cart({ className }: CartProps) {
  const cart = useCartStore((s) => s.cart)
  const preloadSheet = useCartStore((s) => s.preloadSheet)

  const totalQuantity = useMemo(() => {
    return cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
  }, [cart])

  return (
    <div
      className={cn(
        "relative size-8 cursor-pointer items-center justify-center fill-none transition-transform hover:scale-105",
        className
      )}
      onMouseOver={preloadSheet}
      onTouchStart={preloadSheet}
    >
      <BagIcon className="text-black" />
      {totalQuantity > 0 && (
        <div className="absolute bottom-0 right-0 flex size-4 items-center justify-center rounded-full bg-black text-[11px] text-white">
          {totalQuantity}
        </div>
      )}
      <OpenCartButton />
    </div>
  )
}

"use client"

import { Alert, AlertDescription, AlertTitle } from "components/ui/alert"
import { Button } from "components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAddProductStore } from "stores/add-product-store"
import { useCartStore } from "stores/cart-store"
import { cn } from "utils/cn"
import { type CurrencyType, mapCurrencyToSign } from "utils/map-currency-to-sign"
import { filterImagesByVisualOption, getVisualOptionValueFromCombination } from "utils/visual-variant-utils"
import { getFeaturedImage, getVariantPrice } from "utils/medusa-product-helpers"
import type { Combination } from "utils/product-options-utils"
import { HttpTypes } from "@medusajs/types"

// Type guard to check if combination is a Combination type
function isCombination(combo: Combination | HttpTypes.StoreProductVariant | null): combo is Combination {
  return combo !== null && 'availableForSale' in combo
}

export function ProductAddedAlert({ className }: { className?: string }) {
  const router = useRouter()
  const product = useAddProductStore((s) => s.product)
  const combination = useAddProductStore((s) => s.combination)
  const openCart = useCartStore((s) => s.openCart)
  const preloadSheet = useCartStore((s) => s.preloadSheet)
  const checkoutReady = useCartStore((s) => s.checkoutReady)
  const _cart = useCartStore((s) => s.cart)

  // Use Medusa's payment_collection?.payment_sessions to get checkout URL or fallback
  const checkoutUrl = `/checkout`

  if (!product || !combination) return null

  const visualOptionValue = getVisualOptionValueFromCombination(combination)

  const images = product.images ?? []
  const variantImages = filterImagesByVisualOption(images, visualOptionValue || null)
  const variantImage = variantImages[0]
  const displayImage = variantImage || getFeaturedImage(product)

  // Get price from combination
  const priceData = isCombination(combination) 
    ? combination.price 
    : getVariantPrice(combination)

  return (
    <Alert
      className={cn(
        "absolute right-0 top-[5.5rem] z-50 w-full min-w-[220px] border border-input bg-white transition-all md:top-[4.5rem] md:min-w-[350px]",
        className
      )}
    >
      <AlertTitle>Product has been added to the cart!</AlertTitle>
      <AlertDescription className="mt-6 flex flex-col">
        <div className="mb-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Image
              width={48}
              height={48}
              alt={product.title || "Product image"}
              className="z-0 select-none rounded object-cover transition-transform group-hover:scale-105"
              src={displayImage?.url || "/default-product-image.svg"}
              sizes="(max-width: 450px) 150px, 300px"
            />
            <div className="flex flex-col">
              <span className="font-bold">{product.title}</span>
              <span className="text-xs text-gray-400">{combination?.title}</span>
            </div>
          </div>
          {priceData && (
            <span className="text-xs">
              {mapCurrencyToSign(priceData.currencyCode as CurrencyType)}
              {priceData.amount.toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button
            onMouseEnter={preloadSheet}
            onClick={openCart}
            variant="outline"
            className="bg-white transition-all hover:scale-105"
          >
            View cart
          </Button>
          <Button
            variant="default"
            onClick={() => router.push(checkoutUrl)}
            className="rounded-md px-10 py-4 transition-all hover:scale-105"
            disabled={!checkoutReady}
          >
            Checkout
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

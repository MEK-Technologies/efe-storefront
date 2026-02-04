import Image from "next/image"
import Link from "next/link"
import { cn } from "utils/cn"
import { filterImagesByVisualOption, getVisualOptionValueFromCombination } from "utils/visual-variant-utils"
import { ChangeQuantityButton } from "./change-quantity-button"
import { DeleteButton } from "./delete-button"
import { HttpTypes } from "@medusajs/types"
import { formatPrice, getFeaturedImage } from "utils/medusa-product-helpers"

interface CartItemProps {
  item: HttpTypes.StoreCartLineItem
  onProductClick: () => void
  className?: string
  currencyCode?: string
}

export function CartItem({ item, onProductClick, className, currencyCode = "USD" }: CartItemProps) {
  // Medusa StoreCartLineItem has variant and product details
  const variant = item.variant
  // If variant is not expanded, we might only have product_handle or similar if mapped. 
  // StoreCartLineItem usually has product_id and variant_id.
  // The 'variant' object in StoreCartLineItem usually contains 'product' if expanded.
  
  const product = item.variant?.product
  
  // Fallback if product not expanded on line item (though usually it is for storefront display)
  const title = item.product_title || item.title
  const handle = item.variant?.product?.handle || ""
  const variantTitle = item.variant_title || ""

  // Images
  // Try to find image matching visual option if applicable
  // Or use item.thumbnail
  // Or use product featured image
  
  let displayImage = item.thumbnail
  
  if (variant && product) {
    const visualOptionValue = getVisualOptionValueFromCombination(variant)
    const images = product.images || []
    const variantImages = filterImagesByVisualOption(images, visualOptionValue || null)
    if (variantImages.length > 0) {
      displayImage = variantImages[0].url
    } else {
       const feat = getFeaturedImage(product)
       if (feat) displayImage = feat.url
    }
  }

  // Price
  const priceFormatted = formatPrice(item.unit_price, currencyCode)

  return (
    <li className={cn("flex items-center justify-between gap-6 py-2", className)}>
      <div className="flex h-[115px] w-[90px] shrink-0 items-center bg-neutral-100">
        <Image
          src={displayImage || "/default-product-image.svg"}
          alt={product?.title || title || "Imagen del producto"}
          width={115}
          height={90}
          sizes="100px"
        />
      </div>
      <div className="flex flex-1 flex-col items-start justify-around gap-0.5 text-[13px]">
        <Link href={`/product/${handle}`} onClick={onProductClick}>
          <h2 className="line-clamp-1 hover:underline">
            {title}
          </h2>
          <p className="line-clamp-1 text-neutral-500">{variantTitle}</p>
        </Link>
        <p className="py-2 font-bold">{priceFormatted}</p>
        <div className="flex w-full items-center justify-between">
          <DeleteButton id={item.id} />

          <div className="boder-black flex h-[32px] w-[100px] justify-between border p-4 text-[14px] text-neutral-500">
            <ChangeQuantityButton
              id={item.id}
              variantId={item.variant_id || ""}
              quantity={item.quantity - 1}
              productId={item.product_id || ""}
            >
              {"-"}
              </ChangeQuantityButton>
            <div className="flex cursor-not-allowed items-center gap-2 text-black">{item.quantity}</div>
            <ChangeQuantityButton
              id={item.id}
              variantId={item.variant_id || ""}
              quantity={item.quantity + 1}
              productId={item.product_id || ""}
            >

              {"+"}
              </ChangeQuantityButton>

          </div>
        </div>
      </div>
    </li>
  )
}

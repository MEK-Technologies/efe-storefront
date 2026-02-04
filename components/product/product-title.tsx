import { HttpTypes } from "@medusajs/types"
import { ProductPrice } from "./product-price"

type ProductTitleProps = {
  title: string
  className?: string
  variant?: HttpTypes.StoreProductVariant | null
  // Legacy props for backward compatibility
  currency?: string
  price?: string | number | null
}

export const ProductTitle = ({ title, variant: productVariant, currency, price, className }: ProductTitleProps) => {
  return (
    <div className={className}>
      <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">{title}</h1>
      {productVariant ? (
        <div className="mt-2">
          <ProductPrice variant={productVariant} displayVariant="detailed" />
        </div>
      ) : (
        price !== null && price !== undefined && (
          <p className="mt-2 text-xl">
            {currency}
            {typeof price === "number" ? price.toFixed(2) : price}
          </p>
        )
      )}
    </div>
  )
}

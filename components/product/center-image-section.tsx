import type { Dispatch, SetStateAction } from "react"
import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { cn } from "utils/cn"
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "components/ui/carousel"

type CenterSectionProps = {
  images: HttpTypes.StoreProductImage[]
  setApi: Dispatch<SetStateAction<CarouselApi>>
  className?: string
}

export const CenterSection = ({ className, images, setApi }: CenterSectionProps) => {
  const hasOnlyOneImage = images.length <= 1
  return (
    <div className={cn("flex flex-col rounded-t-lg", className)}>
      <div className="md:sticky md:top-[100px]">
        <Carousel className="[&>div]:rounded-lg" setApi={setApi}>
          <CarouselContent className={cn("rounded-lg", hasOnlyOneImage ? "ml-0" : "")}>
            {images.map((image, index) => (
              <CarouselItem
                className={cn("relative aspect-square rounded-lg bg-gray-50 overflow-hidden", hasOnlyOneImage && "pl-0")}
                key={image.url}
              >
              <Image
                alt={`Imagen del producto ${index + 1}`}
                src={image.url || "/default-product-image.svg"}
                fill
                priority={index === 0}
                className="object-contain p-2"
                sizes="(max-width: 450px) 300px, 480px"
              />
              </CarouselItem>
            ))}
          </CarouselContent>
          {!hasOnlyOneImage && (
            <div className="mt-4 flex justify-center gap-10 pb-6">
              <CarouselPrevious className="relative" />
              <CarouselNext className="relative" />
            </div>
          )}
        </Carousel>
      </div>
    </div>
  )
}

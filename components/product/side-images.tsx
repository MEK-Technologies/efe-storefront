import Image from "next/image"
import { type Dispatch, type SetStateAction, useCallback } from "react"
import { Carousel, type CarouselApi, CarouselContent } from "components/ui/carousel"
import { cn } from "utils/cn"
import { HttpTypes } from "@medusajs/types"

type SideImagesProps = {
  images: HttpTypes.StoreProductImage[]
  api: CarouselApi
  setThumbsApi: Dispatch<SetStateAction<CarouselApi>>
  current: number
  className?: string
}

export const SideImages = ({ className, images, api, setThumbsApi, current }: SideImagesProps) => {
  const onThumbClick = useCallback(
    (index: number) => {
      api?.scrollTo(index)
    },
    [api]
  )

  return (
    <div className={className}>
      <Carousel
        className="my-4 md:sticky md:top-[100px]"
        orientation="vertical"
        setApi={setThumbsApi}
        opts={{ skipSnaps: true, watchDrag: false }}
      >
        <CarouselContent className="mt-0 w-full flex-row justify-center gap-4 md:flex-col">
          {images.map((image, index) => (
            <div
              className={cn("relative aspect-square cursor-pointer overflow-hidden rounded-md border-2 border-transparent bg-gray-50", index === current && "border-black")}
              key={"thumbnail_" + image.url}
              onMouseEnter={() => onThumbClick(index)}
            >
              <Image
                alt={`Imagen del producto ${index + 1}`}
                src={image.url || `/default-product-image.svg`}
                fill
                className="object-contain p-1"
                sizes="100px"
              />
            </div>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}

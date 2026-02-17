"use client"

import { useEffect, useState, useTransition } from "react"

import { getParsedFavoritesHandles, toggleFavoriteProduct } from "app/actions/favorites.actions"

import { Spinner } from "components/spinner"
import { HeartIcon } from "components/icons/heart-icon"
import { Button } from "components/ui/button"
import { cn } from "utils/cn"

export function FavoriteMarker({ handle, variantId }: { handle: string; variantId?: string }) {
  const [isActive, setIsActive] = useState<boolean>(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const checkIsFavorite = () => {
      startTransition(async () => {
        const favorites = await getParsedFavoritesHandles()

        const exists = favorites.some((f) => f.variantHandle === handle && (variantId ? f.variantId === variantId : true))

        setIsActive(exists)
      })
    }

    checkIsFavorite()
  }, [handle, variantId])

  const handleClick = async () => {
    setIsAnimating(true)
    const isFavorite = await toggleFavoriteProduct(null, handle, variantId)

    setIsActive(isFavorite)
  }

  return (
    <>
      <Button
        aria-label="Marcar como favorito"
        type="submit"
        onClick={handleClick}
        variant="outline"
        className="group w-full bg-white transition-all hover:bg-gray-100"
      >
        {isPending ? (
          <div className="flex items-center justify-center">
            <Spinner className="size-4 bg-transparent" />
          </div>
        ) : (
          <>
            <HeartIcon
              onAnimationEnd={() => {
                setIsAnimating(false)
              }}
              className={cn(
                "mr-2 size-5 transition-all",
                isActive ? "text-red-500 " : "text-gray-300",
                isAnimating && "animate-single-bounce"
              )}
            />
            {isActive ? "Guardado en favoritos" : "Añadir a favoritos"}
          </>
        )}
      </Button>
    </>
  )
}

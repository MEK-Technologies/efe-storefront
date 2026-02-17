"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "components/ui/dropdown-menu"
import { ChevronIcon } from "components/icons/chevron-icon"
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs"

export enum Sorting {
  PRICE_DESC = "minPrice:desc",
  PRICE_ASC = "minPrice:asc",
  DATE_ASC = "updatedAtTimestamp:asc",
  DATE_DESC = "updatedAtTimestamp:desc",
  RELEVANCY = "",
  RATING = "avgRating:desc",
}

const LABELS = {
  [Sorting.PRICE_DESC]: "Precio: Mayor a Menor",
  [Sorting.PRICE_ASC]: "Precio: Menor a Mayor",
  [Sorting.RATING]: "Valoración de Clientes",
  [Sorting.DATE_ASC]: "Más antiguos",
  [Sorting.DATE_DESC]: "Más recientes",
  [Sorting.RELEVANCY]: "Relevancia",
}

interface SorterProps {
  className?: string
}

export function Sorter({ className }: SorterProps) {
  const [sortBy, setSortBy] = useQueryState("sortBy", {
    ...parseAsStringEnum<Sorting>(Object.values(Sorting)).withDefault(Sorting.RELEVANCY),
    shallow: false,
    history: "push",
  })
  const [page, setPage] = useQueryState("page", {
    ...parseAsInteger,
    shallow: false,
    history: "push",
    clearOnDefault: true,
  })

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex cursor-pointer flex-nowrap items-center justify-center gap-1 px-2 py-1.5 font-medium text-black [&[data-state=open]>svg]:rotate-180">
            <span>{sortBy ? LABELS[sortBy as keyof typeof LABELS] : "Ordenar por"}</span>
            <ChevronIcon />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[240px] rounded-md border-none bg-white p-0 text-sm font-medium tracking-tight text-primary shadow-2xl ring-1 ring-black/10"
          align="end"
        >
          {Object.entries(LABELS).map(([key, label]) => (
            <DropdownMenuItem
              key={label}
              className="cursor-pointer px-3.5 py-3 text-sm last:border-b-0 hover:bg-gray-200 focus:bg-gray-200 active:bg-gray-200"
              onClick={() => {
                setSortBy(key as Sorting)
                if (page && page > 1) {
                  setPage(1)
                }
              }}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

"use client"

import { HttpTypes } from "@medusajs/types"
import { cn } from "utils/cn"
import { Combination } from "utils/product-options-utils"
import { createMultiOptionSlug, getMultiOptionFromSlug } from "utils/visual-variant-utils"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "components/ui/dropdown-menu"
import { Button } from "components/ui/button"
import { ChevronDown } from "lucide-react"
import { useRef } from "react"

interface VariantDropdownsProps {
  variants: HttpTypes.StoreProductVariant[] | null | undefined
  className?: string
  combination: Combination | undefined
  handle: string
  currentSlug: string
}

interface OptionData {
  name: string
  values: string[]
  currentValue?: string
}

function slugifyOptionName(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "")
}

function slugifyOptionValue(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "")
}

export function VariantDropdowns({ variants, className, handle, combination, currentSlug }: VariantDropdownsProps) {
  const router = useRouter()
  const dropdownContainerRef = useRef<HTMLDivElement>(null)

  if (!variants || variants.length <= 1) {
    return null
  }

  const optionsData: OptionData[] = []
  const optionNames = new Set<string>()

  const currentOptions = getMultiOptionFromSlug(currentSlug)

  // Extract unique option names from variants
  variants.forEach((variant) => {
    variant.options?.forEach((option) => {
      if (option.option?.title) {
        optionNames.add(option.option.title)
      }
    })
  })

  // Build options data with values and current selection
  optionNames.forEach((optionName) => {
    const values = new Set<string>()

    variants.forEach((variant) => {
      const option = variant.options?.find((opt) => opt.option?.title === optionName)
      if (option?.value) {
        values.add(option.value)
      }
    })

    let currentValue: string | undefined
    if (combination) {
      const selectedVariant = variants.find((v) => v.id === combination.id)
      const selectedOption = selectedVariant?.options?.find((opt) => opt.option?.title === optionName)
      currentValue = selectedOption?.value
    }

    optionsData.push({
      name: optionName,
      values: Array.from(values).sort(),
      currentValue,
    })
  })

  const handleOptionChange = (optionName: string, optionValue: string) => {
    const newOptions = { ...currentOptions }

    newOptions[slugifyOptionName(optionName)] = slugifyOptionValue(optionValue)

    const targetVariant = variants.find((variant) => {
      return Object.entries(newOptions).every(([slugOptionName, slugOptionValue]) => {
        return variant.options?.some((option) => {
          if (!option.option?.title || !option.value) return false
          const optionNameSlug = slugifyOptionName(option.option.title)
          const optionValueSlug = slugifyOptionValue(option.value)
          return optionNameSlug === slugOptionName && optionValueSlug === slugOptionValue
        })
      })
    })

    if (targetVariant) {
      const optionsForUrl: Record<string, string> = {}
      targetVariant.options?.forEach((option) => {
        if (option.option?.title && option.value) {
          optionsForUrl[option.option.title] = option.value
        }
      })

      const newSlug = createMultiOptionSlug(handle, optionsForUrl)
      router.push(`/product/${newSlug}`, { scroll: false })
    }
  }

  if (optionsData.length === 0) {
    return null
  }

  return (
    <div ref={dropdownContainerRef} className={cn("flex flex-col gap-4", className)}>
      <p className="text-center text-sm text-neutral-500 md:text-left">Select options</p>
      <div className="flex flex-col gap-3">
        {optionsData.map((option) => (
          <div key={option.name} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-700">{option.name}</label>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between" size="sm">
                  {option.currentValue || `Select ${option.name}`}
                  <ChevronDown className="ml-2 size-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-full min-w-[200px]" align="start">
                {option.values.map((value) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => handleOptionChange(option.name, value)}
                    className={cn("cursor-pointer", option.currentValue === value && "bg-accent font-medium")}
                  >
                    {value}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  )
}

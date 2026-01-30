"use client"

import { useEffect, useState, useTransition } from "react"
import { getShippingOptions, selectShippingMethod } from "app/actions/checkout.actions"
import { HttpTypes } from "@medusajs/types"
import { Label } from "components/ui/label"
import { RadioGroup, RadioGroupItem } from "components/ui/radio-group"
import { toast } from "sonner"

export function ShippingOptions() {
  const [options, setOptions] = useState<HttpTypes.StoreCartShippingOption[]>([])
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const fetchOptions = async () => {
      const result = await getShippingOptions()

      if (result.ok && result.options) {
        setOptions(result.options)
      } else {
        toast.error(result.error || "Failed to load shipping options")
      }

      setIsLoading(false)
    }

    fetchOptions()
  }, [])

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId)

    startTransition(async () => {
      const result = await selectShippingMethod(null, optionId)

      if (!result.ok) {
        toast.error(result.error || "Failed to select shipping method")
        setSelectedOption("")
      } else {
        toast.success("Shipping method updated")
      }
    })
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">Shipping Method</h3>
        <p className="text-sm text-gray-600">Loading shipping options...</p>
      </div>
    )
  }

  if (options.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">Shipping Method</h3>
        <p className="text-sm text-gray-600">
          No shipping options available. Please check your address.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold">Shipping Method</h3>
      <RadioGroup value={selectedOption} onValueChange={handleSelectOption} disabled={isPending}>
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={option.id} id={option.id} />
            <Label htmlFor={option.id} className="flex flex-1 cursor-pointer items-center justify-between">
              <span>{option.name}</span>
              <span className="font-medium">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: option.amount ? "usd" : "usd", // TODO: Get currency from cart
                }).format((option.amount || 0) / 100)}
              </span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

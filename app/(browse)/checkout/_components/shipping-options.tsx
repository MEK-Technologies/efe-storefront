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
        toast.error(result.error || "Error al cargar opciones de envío")
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
        toast.error(result.error || "Error al seleccionar método de envío")
        setSelectedOption("")
      } else {
        toast.success("Método de envío actualizado")
      }
    })
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">Método de Envío</h3>
        <p className="text-sm text-gray-600">Cargando opciones de envío...</p>
      </div>
    )
  }

  if (options.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">Método de Envío</h3>
        <p className="text-sm text-gray-600">
          No hay opciones de envío disponibles. Por favor, verifica tu dirección.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold">Método de Envío</h3>
      <RadioGroup value={selectedOption} onValueChange={handleSelectOption} disabled={isPending}>
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={option.id} id={option.id} />
            <Label htmlFor={option.id} className="flex flex-1 cursor-pointer items-center justify-between">
              <span>{option.name}</span>
              <span className="font-medium">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: option.amount ? "dop" : "dop", // TODO: Get currency from cart
                }).format(option.amount || 0)}
              </span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

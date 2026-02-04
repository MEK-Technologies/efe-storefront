"use client"

import { useState, useTransition } from "react"
import { completePayment } from "app/actions/payment.actions"
import { Button } from "components/ui/button"
import { toast } from "sonner"

interface PaymentSectionProps {
  onBack: () => void
}

export function PaymentSection({ onBack }: PaymentSectionProps) {
  const [isPending, startTransition] = useTransition()
  const [inventoryErrors, setInventoryErrors] = useState<Array<{
    item_id: string
    title: string
    message: string
    available_quantity: number
    requested_quantity: number
  }> | null>(null)

  const handleCompleteOrder = () => {
    setInventoryErrors(null)
    
    startTransition(async () => {
      try {
        const result = await completePayment()

        if (!result.ok) {
          if (result.inventoryErrors && result.inventoryErrors.length > 0) {
            setInventoryErrors(result.inventoryErrors)
            toast.error("Algunos productos no están disponibles")
          } else {
            toast.error(result.error || "Error al completar la orden")
          }
        }
        // If successful, the server action will redirect
      } catch (error) {
        // Check if this is a Next.js redirect (which means success)
        if (error && typeof error === "object" && "digest" in error) {
          // This is expected - the redirect throws but it's actually success
          return
        }
        toast.error("Ocurrió un error inesperado")
      }
    })
  }

  return (
    <div className="space-y-6">
      {inventoryErrors && inventoryErrors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="mb-2 font-semibold text-red-800">Problemas de Inventario</h3>
          <ul className="space-y-1 text-sm text-red-700">
            {inventoryErrors.map((error) => (
              <li key={error.item_id}>
                <strong>{error.title}:</strong> {error.message}
                {error.available_quantity > 0 && (
                  <span className="ml-1">
                    (solicitado: {error.requested_quantity}, disponible: {error.available_quantity})
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-red-600">
            Por favor, regresa al carrito y ajusta las cantidades antes de continuar.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="mb-2 font-semibold text-green-800">Resumen de Pago</h3>
          <p className="text-sm text-green-700">
            Al completar la orden, recibirás instrucciones para realizar el pago.
          </p>
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onBack} disabled={isPending}>
            Atrás
          </Button>
          <Button
            type="button"
            onClick={handleCompleteOrder}
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? "Procesando..." : "Completar Orden"}
          </Button>
        </div>
      </div>
    </div>
  )
}

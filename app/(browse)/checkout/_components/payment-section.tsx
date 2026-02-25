"use client"

import { useState, useTransition } from "react"
import { HttpTypes } from "@medusajs/types"
import { completePayment } from "app/actions/payment.actions"
import { Button } from "components/ui/button"
import { toast } from "sonner"

interface PaymentSectionProps {
  onBack: () => void
  cart: HttpTypes.StoreCart
}

export function PaymentSection({ onBack, cart }: PaymentSectionProps) {
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
        <div className="rounded-lg border bg-gray-50 p-6">
          <h3 className="mb-4 text-lg font-semibold">Resumen de tu Orden</h3>
          
          <div className="space-y-4">
            {cart?.items?.map((item) => (
              <div key={item.id} className="flex gap-4">
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-16 w-16 rounded object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                </div>
                <p className="font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: cart?.currency_code || "USD",
                  }).format(item.total || 0)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: cart?.currency_code || "USD",
                }).format(cart?.subtotal || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Envío</span>
              <span>
                {cart?.shipping_total != null
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: cart?.currency_code || "USD",
                    }).format(cart.shipping_total)
                  : "Por calcular"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Impuesto</span>
              <span>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: cart?.currency_code || "USD",
                }).format(cart?.tax_total || 0)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Total</span>
              <span>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: cart?.currency_code || "USD",
                }).format(cart?.total || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="mb-2 font-semibold text-green-800">Confirmación de Pedido</h3>
          <p className="text-sm text-green-700">
            Al confirmar la orden, recibirás instrucciones para completar el pago y el envío.
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
            {isPending ? "Procesando..." : "Confirmar Orden"}
          </Button>
        </div>
      </div>
    </div>
  )
}

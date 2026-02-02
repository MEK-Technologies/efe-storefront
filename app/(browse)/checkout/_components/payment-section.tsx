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
            toast.error("Some items are out of stock")
          } else {
            toast.error(result.error || "Failed to complete order")
          }
        }
        // If successful, the server action will redirect
      } catch (error) {
        // Check if this is a Next.js redirect (which means success)
        if (error && typeof error === "object" && "digest" in error) {
          // This is expected - the redirect throws but it's actually success
          return
        }
        toast.error("An unexpected error occurred")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">
          <strong>Demo Mode:</strong> This is a simplified payment section. In production, you would integrate
          Stripe Elements or another payment provider here.
        </p>
      </div>

      {inventoryErrors && inventoryErrors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="mb-2 font-semibold text-red-800">Inventory Issues</h3>
          <ul className="space-y-1 text-sm text-red-700">
            {inventoryErrors.map((error) => (
              <li key={error.item_id}>
                <strong>{error.title}:</strong> {error.message}
                {error.available_quantity > 0 && (
                  <span className="ml-1">
                    (requested: {error.requested_quantity}, available: {error.available_quantity})
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-red-600">
            Please return to your cart and adjust quantities before proceeding.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Payment Method</h3>
          <p className="text-sm text-gray-600">
            Credit Card payment (Stripe integration required)
          </p>
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onBack} disabled={isPending}>
            Back
          </Button>
          <Button
            type="button"
            onClick={handleCompleteOrder}
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? "Processing..." : "Complete Order"}
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useTransition } from "react"
import { completePayment } from "app/actions/payment.actions"
import { Button } from "components/ui/button"
import { toast } from "sonner"

interface PaymentSectionProps {
  onBack: () => void
}

export function PaymentSection({ onBack }: PaymentSectionProps) {
  const [isPending, startTransition] = useTransition()

  const handleCompleteOrder = () => {
    startTransition(async () => {
      try {
        const result = await completePayment()

        if (!result.ok) {
          toast.error(result.error || "Failed to complete order")
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

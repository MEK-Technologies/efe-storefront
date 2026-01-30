"use client"

import { useState, useTransition } from "react"
import { HttpTypes } from "@medusajs/types"
import { updateBillingAddress, updateCartEmail, updateShippingAddress } from "app/actions/checkout.actions"
import { ShippingOptions } from "./shipping-options"
import { PaymentSection } from "./payment-section"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Checkbox } from "components/ui/checkbox"
import { toast } from "sonner"

interface CheckoutFormProps {
  cart: HttpTypes.StoreCart
}

type CheckoutStep = "contact" | "shipping" | "payment"

export function CheckoutForm({ cart }: CheckoutFormProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("contact")
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [isPending, startTransition] = useTransition()

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updateCartEmail(null, formData)

      if (result.ok) {
        setCurrentStep("shipping")
      } else {
        toast.error(result.error || "Failed to update email")
      }
    })
  }

  const handleShippingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const shippingResult = await updateShippingAddress(null, formData)

      if (!shippingResult.ok) {
        toast.error(shippingResult.error || "Failed to update shipping address")
        return
      }

      // If billing is different, update billing address
      if (!sameAsShipping) {
        const billingResult = await updateBillingAddress(null, formData)
        if (!billingResult.ok) {
          toast.error(billingResult.error || "Failed to update billing address")
          return
        }
      }

      setCurrentStep("payment")
    })
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {(["contact", "shipping", "payment"] as CheckoutStep[]).map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep === step
                  ? "bg-black text-white"
                  : index < ["contact", "shipping", "payment"].indexOf(currentStep)
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {index + 1}
            </div>
            <span className="ml-2 capitalize">{step}</span>
            {index < 2 && <div className="mx-4 h-0.5 w-12 bg-gray-300" />}
          </div>
        ))}
      </div>

      {/* Contact Information */}
      {currentStep === "contact" && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Contact Information</h2>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={cart.email || ""}
                required
                placeholder="your@email.com"
                disabled={isPending}
              />
            </div>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Saving..." : "Continue to Shipping"}
            </Button>
          </form>
        </div>
      )}

      {/* Shipping Information */}
      {currentStep === "shipping" && (
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Shipping Address</h2>
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    defaultValue={cart.shipping_address?.first_name || ""}
                    required
                    disabled={isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    defaultValue={cart.shipping_address?.last_name || ""}
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address_1">Address</Label>
                <Input
                  id="address_1"
                  name="address_1"
                  defaultValue={cart.shipping_address?.address_1 || ""}
                  required
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="address_2">Apartment, suite, etc. (optional)</Label>
                <Input
                  id="address_2"
                  name="address_2"
                  defaultValue={cart.shipping_address?.address_2 || ""}
                  disabled={isPending}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={cart.shipping_address?.city || ""}
                    required
                    disabled={isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="province">Province/State</Label>
                  <Input
                    id="province"
                    name="province"
                    defaultValue={cart.shipping_address?.province || ""}
                    disabled={isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    defaultValue={cart.shipping_address?.postal_code || ""}
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country_code">Country</Label>
                <Input
                  id="country_code"
                  name="country_code"
                  defaultValue={cart.shipping_address?.country_code || cart.region?.countries?.[0]?.iso_2 || "us"}
                  required
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={cart.shipping_address?.phone || ""}
                  disabled={isPending}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="same-as-shipping"
                  checked={sameAsShipping}
                  onCheckedChange={(checked) => setSameAsShipping(checked === true)}
                />
                <Label htmlFor="same-as-shipping" className="cursor-pointer">
                  Billing address same as shipping
                </Label>
              </div>

              {!sameAsShipping && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">Billing Address</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="billing_first_name">First Name</Label>
                      <Input
                        id="billing_first_name"
                        name="billing_first_name"
                        required={!sameAsShipping}
                        disabled={isPending}
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing_last_name">Last Name</Label>
                      <Input
                        id="billing_last_name"
                        name="billing_last_name"
                        required={!sameAsShipping}
                        disabled={isPending}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="billing_address_1">Address</Label>
                    <Input
                      id="billing_address_1"
                      name="billing_address_1"
                      required={!sameAsShipping}
                      disabled={isPending}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="billing_city">City</Label>
                      <Input
                        id="billing_city"
                        name="billing_city"
                        required={!sameAsShipping}
                        disabled={isPending}
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing_postal_code">Postal Code</Label>
                      <Input
                        id="billing_postal_code"
                        name="billing_postal_code"
                        required={!sameAsShipping}
                        disabled={isPending}
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing_country_code">Country</Label>
                      <Input
                        id="billing_country_code"
                        name="billing_country_code"
                        defaultValue={cart.region?.countries?.[0]?.iso_2 || "us"}
                        required={!sameAsShipping}
                        disabled={isPending}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep("contact")}
                  disabled={isPending}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? "Saving..." : "Continue to Payment"}
                </Button>
              </div>
            </form>
          </div>

          <ShippingOptions />
        </div>
      )}

      {/* Payment */}
      {currentStep === "payment" && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Payment</h2>
          <PaymentSection onBack={() => setCurrentStep("shipping")} />
        </div>
      )}
    </div>
  )
}

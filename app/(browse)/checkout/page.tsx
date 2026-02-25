import { redirect } from "next/navigation"
import { retrieveCart } from "lib/medusa/data/cart"
import { getCartId } from "lib/medusa/data/cookies"
import { CheckoutForm } from "./_components/checkout-form"
import { getCustomerAddressesAction } from "app/actions/address.actions"

export default async function CheckoutPage() {
  const cartId = await getCartId()

  if (!cartId) {
    redirect("/")
  }

  const cart = await retrieveCart(cartId)

  if (!cart || !cart.items || cart.items.length === 0) {
    redirect("/")
  }

  // Load user's saved addresses to pre-fill checkout if cart doesn't have one
  const addresses = await getCustomerAddressesAction()
  const defaultAddress = addresses?.[0] || null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">Finalizar Compra</h1>

        <div className="mx-auto max-w-4xl">
          {/* Main checkout form */}
          <CheckoutForm cart={cart} defaultAddress={defaultAddress} />
        </div>
      </div>
    </div>
  )
}

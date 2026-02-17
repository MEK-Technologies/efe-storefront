import { redirect } from "next/navigation"
import { retrieveCart } from "lib/medusa/data/cart"
import { getCartId } from "lib/medusa/data/cookies"
import { CheckoutForm } from "./_components/checkout-form"

export default async function CheckoutPage() {
  const cartId = await getCartId()

  if (!cartId) {
    redirect("/")
  }

  const cart = await retrieveCart(cartId)

  if (!cart || !cart.items || cart.items.length === 0) {
    redirect("/")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">Finalizar Compra</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main checkout form */}
          <div className="lg:col-span-2">
            <CheckoutForm cart={cart} />
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Resumen del Pedido</h2>

              <div className="space-y-4">
                {cart.items.map((item) => (
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
                        currency: cart.currency_code,
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
                      currency: cart.currency_code,
                    }).format(cart.subtotal || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío</span>
                  <span>
                    {cart.shipping_total
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: cart.currency_code,
                        }).format(cart.shipping_total)
                      : "Se calculará en el siguiente paso"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Impuesto</span>
                  <span>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: cart.currency_code,
                    }).format(cart.tax_total || 0)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: cart.currency_code,
                    }).format(cart.total || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

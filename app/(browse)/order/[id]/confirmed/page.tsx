import { redirect } from "next/navigation"
import { retrieveOrder } from "lib/medusa/data/orders"
import { formatPrice } from "utils/medusa-product-helpers"
import Link from "next/link"
import { Button } from "components/ui/button"

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await retrieveOrder(id)

  if (!order) {
    redirect("/")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Success Message */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold">¡Pedido Confirmado!</h1>
          <p className="text-gray-600">
            Gracias por tu pedido. Enviaremos un correo de confirmación en breve.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Número de Pedido: <span className="font-semibold">#{order.display_id}</span>
          </p>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Items */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Artículos del Pedido</h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="h-20 w-20 rounded object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      {item.variant?.title && item.variant.title !== "Default" && (
                        <p className="text-sm text-gray-600">{item.variant.title}</p>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatPrice(item.total || 0, order.currency_code)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="mt-6 space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal || 0, order.currency_code)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Envío</span>
                <span>{formatPrice(order.shipping_total || 0, order.currency_code)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Impuesto</span>
                <span>{formatPrice(order.tax_total || 0, order.currency_code)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Total del Pedido</span>
                <span>{formatPrice(order.total || 0, order.currency_code)}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Payment Info */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Shipping Address */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-semibold">Dirección de Envío</h3>
              {order.shipping_address ? (
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900">
                    {order.shipping_address.first_name} {order.shipping_address.last_name}
                  </p>
                  <p>{order.shipping_address.address_1}</p>
                  {order.shipping_address.address_2 && <p>{order.shipping_address.address_2}</p>}
                  <p>
                    {order.shipping_address.city}
                    {order.shipping_address.province && `, ${order.shipping_address.province}`}
                  </p>
                  <p>{order.shipping_address.postal_code}</p>
                  <p className="uppercase">{order.shipping_address.country_code}</p>
                  {order.shipping_address.phone && <p className="mt-2">{order.shipping_address.phone}</p>}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No se proporcionó dirección de envío</p>
              )}
            </div>

            {/* Payment & Status */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-semibold">Estado del Pedido</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado del Pago:</span>
                  <span
                    className={`font-medium ${
                      order.payment_status === "captured"
                        ? "text-green-600"
                        : order.payment_status === "awaiting"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {order.payment_status === "captured" ? "✓ Pagado" : "Pendiente"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado del Envío:</span>
                  <span
                    className={`font-medium ${
                      order.fulfillment_status === "fulfilled"
                        ? "text-green-600"
                        : order.fulfillment_status === "shipped"
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}
                  >
                    {order.fulfillment_status === "fulfilled"
                      ? "✓ Entregado"
                      : order.fulfillment_status === "shipped"
                      ? "Enviado"
                      : "Procesando"}
                  </span>
                </div>
                {order.email && (
                  <div className="mt-3 border-t pt-2">
                    <p className="text-gray-600">Correo de confirmación enviado a:</p>
                    <p className="font-medium text-gray-900">{order.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Continuar Comprando</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/account/orders">Ver Todos los Pedidos</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { notFound } from "next/navigation"
import Image from "next/image"
import { getOrden } from "lib/medusa/data/ordenes"
import Link from "next/link"
import { Button } from "components/ui/button"

function formatPrice(amount: number, currency: string): string {
  return `${currency.toUpperCase()} $${(amount / 100).toFixed(2)}`
}

function getEstadoBadgeClasses(estado: string): string {
  switch (estado) {
    case "completado":
      return "bg-green-100 text-green-800"
    case "pendiente":
      return "bg-yellow-100 text-yellow-800"
    case "procesando":
      return "bg-blue-100 text-blue-800"
    case "cancelado":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default async function OrdenConfirmadaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const orden = await getOrden(id)

  if (!orden) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Success Message */}
        <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="size-8 text-green-600"
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
          <h1 className="mb-2 text-3xl font-bold text-green-800">
            ¡Orden Confirmada!
          </h1>
          <p className="text-green-700">
            Orden #{orden.numero_orden} - {orden.email}
          </p>
        </div>

        {/* Order Summary Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg border bg-white p-6 shadow-sm md:grid-cols-4">
          <div>
            <p className="text-sm text-gray-600">Orden #</p>
            <p className="text-lg font-semibold">{orden.numero_orden}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Estado</p>
            <span
              className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium capitalize ${getEstadoBadgeClasses(orden.estado)}`}
            >
              {orden.estado}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Fecha</p>
            <p className="font-semibold">
              {new Date(orden.created_at).toLocaleDateString("es-DO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-xl font-bold">
              {formatPrice(orden.total, orden.moneda)}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Productos</h2>
          <div className="space-y-4">
            {orden.items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                {(item.thumbnail || item.product?.thumbnail) && (
                  <div className="relative size-20 shrink-0">
                    <Image
                      src={item.thumbnail || item.product?.thumbnail || ""}
                      alt={item.title}
                      fill
                      className="rounded object-cover"
                    />
                  </div>
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
                    {formatPrice(item.unit_price * item.quantity, orden.moneda)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-sm text-gray-500">
                      {formatPrice(item.unit_price, orden.moneda)} c/u
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order Totals */}
          <div className="mt-6 space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(orden.subtotal, orden.moneda)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(orden.total, orden.moneda)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Dirección de Envío</h2>
          <div className="text-gray-700">
            <p className="font-medium">
              {orden.direccion_envio.first_name} {orden.direccion_envio.last_name}
            </p>
            <p>{orden.direccion_envio.address_1}</p>
            {orden.direccion_envio.address_2 && (
              <p>{orden.direccion_envio.address_2}</p>
            )}
            <p>
              {orden.direccion_envio.city}
              {orden.direccion_envio.province && `, ${orden.direccion_envio.province}`}
              {orden.direccion_envio.postal_code && ` ${orden.direccion_envio.postal_code}`}
            </p>
            <p className="uppercase">{orden.direccion_envio.country_code}</p>
            {orden.direccion_envio.phone && (
              <p className="mt-2 text-gray-600">Tel: {orden.direccion_envio.phone}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              Continuar Comprando
            </Button>
          </Link>
          <Link href="/account/orders">
            <Button className="w-full sm:w-auto">
              Ver Mis Órdenes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

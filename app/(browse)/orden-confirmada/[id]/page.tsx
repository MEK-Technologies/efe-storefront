import { notFound } from "next/navigation"
import Image from "next/image"
import { getOrden } from "lib/medusa/data/ordenes"
import Link from "next/link"
import { Button } from "components/ui/button"

function formatPrice(amount: number, currency: string): string {
  return `${currency.toUpperCase()} $${amount.toFixed(2)}`
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
        <div className="mb-8 rounded-lg border bg-card p-8 text-center shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50">
              <svg
                className="size-10 text-green-600"
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
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground">
            ¡Gracias por su orden!
          </h1>
          <p className="text-lg text-muted-foreground">
            Hemos recibido su pedido correctamente.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1 text-sm text-muted-foreground">
            <span className="font-medium">Orden #{orden.numero_orden}</span>
            <span className="h-4 w-px bg-border"></span>
            <span>{orden.email}</span>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Resumen de lo realizado</h2>

        {/* Order Summary Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg border bg-card p-6 shadow-sm md:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Fecha</p>
            <p className="font-medium">
              {new Date(orden.created_at).toLocaleDateString("es-DO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estado</p>
            <span
              className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getEstadoBadgeClasses(
                orden.estado
              )}`}
            >
              {orden.estado}
            </span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Método de Pago</p>
            <p className="font-medium">Contra Entrega</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="font-bold text-primary">
              {formatPrice(orden.total, orden.moneda)}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6 overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="bg-muted/40 px-6 py-4 border-b">
             <h3 className="font-medium">Detalles del Pedido</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {orden.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {(item.thumbnail || item.product?.thumbnail) ? (
                      <Image
                        src={item.thumbnail || item.product?.thumbnail || ""}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                       <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                         <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                         </svg>
                       </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h4 className="font-medium text-foreground">{item.title}</h4>
                        {item.variant?.title && item.variant.title !== "Default" && (
                          <p className="text-sm text-muted-foreground">{item.variant.title}</p>
                        )}
                        <p className="mt-1 text-sm text-muted-foreground">Cant: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-foreground">
                         {formatPrice(item.unit_price * item.quantity, orden.moneda)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="mt-8 space-y-3 border-t pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(orden.subtotal, orden.moneda)}</span>
              </div>
               {/* Assuming shipping is included or calculate if available, for now just subtotal and total logic from previous file */}
              <div className="flex justify-between border-t pt-4 text-lg font-bold text-foreground">
                <span>Total</span>
                <span>{formatPrice(orden.total, orden.moneda)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
           {/* Shipping Address */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold flex items-center gap-2">
              <svg className="size-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Dirección de Envío
            </h3>
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground">
                {orden.direccion_envio.first_name} {orden.direccion_envio.last_name}
              </p>
              <p>{orden.direccion_envio.address_1}</p>
              {orden.direccion_envio.address_2 && (
                <p>{orden.direccion_envio.address_2}</p>
              )}
              <p>
                {orden.direccion_envio.city}
                {orden.direccion_envio.province && `, ${orden.direccion_envio.province}`}
              </p>
              <p className="uppercase">{orden.direccion_envio.country_code} {orden.direccion_envio.postal_code}</p>
              {orden.direccion_envio.phone && (
                <p className="mt-2 flex items-center gap-2">
                   <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {orden.direccion_envio.phone}
                </p>
              )}
            </div>
          </div>
          
           {/* Actions / Support */}
           <div className="flex flex-col justify-between rounded-lg border bg-card p-6 shadow-sm">
              <div>
                <h3 className="mb-4 font-semibold flex items-center gap-2">
                   <svg className="size-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-9.193 9.193M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  ¿Necesitas Ayuda?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Si tienes alguna duda sobre tu pedido, contáctanos indicando tu número de orden.
                </p>
              </div>
              <div className="space-y-3">
                 <Link href="/account/orders" className="block">
                    <Button variant="outline" className="w-full">
                      Ver Mis Órdenes
                    </Button>
                  </Link>
                  <Link href="/" className="block">
                    <Button className="w-full">
                      Volver a la Tienda
                    </Button>
                  </Link>
              </div>
           </div>
        </div>

      </div>
    </div>
  )
}

"use client"

import { useAuth } from "hooks/useAuth"
import { useEffect, useState } from "react"
import Link from "next/link"
import { listOrdenesByEmail, type OrdenListItem } from "lib/medusa/data/ordenes"

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

export default function OrdersPage() {
  const { customer } = useAuth()
  const [ordenes, setOrdenes] = useState<OrdenListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrdenes() {
      if (!customer?.email) {
        setLoading(false)
        return
      }

      try {
        setError(null)
        const data = await listOrdenesByEmail(customer.email)
        setOrdenes(data)
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError("Error al cargar las órdenes")
      } finally {
        setLoading(false)
      }
    }

    fetchOrdenes()
  }, [customer?.email])

  if (!customer) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Cargando órdenes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mis Órdenes</h2>
        <p className="mt-1 text-sm text-gray-600">
          Ver y seguir el historial de tus órdenes
        </p>
      </div>

      {ordenes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <div className="mx-auto mb-4 text-6xl">📦</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No tienes órdenes aún</h3>
          <p className="mb-6 text-sm text-gray-600">
            Comienza a comprar para ver tus órdenes aquí
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Explorar Productos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ordenes.map((orden) => {
            const ordenDate = new Date(orden.created_at)
            
            return (
              <Link
                key={orden.id}
                href={`/orden-confirmada/${orden.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Orden #{orden.numero_orden}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getEstadoBadgeClasses(orden.estado)}`}
                      >
                        {orden.estado}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      {ordenDate.toLocaleDateString("es-DO", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {orden.items_count} {orden.items_count === 1 ? "producto" : "productos"}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {orden.moneda} ${(orden.total).toFixed(2)}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                      Ver Detalles →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

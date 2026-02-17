"use client"

import { useAuth } from "hooks/useAuth"
import Link from "next/link"

export default function AccountPage() {
  const { customer } = useAuth()

  if (!customer) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Cargando tu cuenta...</p>
      </div>
    )
  }

  const stats = [
    {
      label: "Total de Órdenes",
      value: 0, // Orders would come from separate API call
      icon: "📦",
      href: "/account/orders",
    },
    {
      label: "Direcciones Guardadas",
      value: customer.addresses?.length || 0,
      icon: "📍",
      href: "/account/addresses",
    },
    {
      label: "Estado de la Cuenta",
      value: "Activa",
      icon: "✅",
      href: "/account/profile",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Panel</h2>
        <p className="mt-1 text-sm text-gray-600">
          Bienvenido de nuevo, {customer.first_name || "estimado cliente"}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 transition-all hover:border-gray-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Acciones Rápidas */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/account/profile"
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
          >
            <span className="text-2xl">✏️</span>
            <div>
              <p className="font-medium text-gray-900">Editar Perfil</p>
              <p className="text-sm text-gray-600">Actualiza tu información personal</p>
            </div>
          </Link>

          <Link
            href="/account/orders"
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
          >
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-medium text-gray-900">Ver Órdenes</p>
              <p className="text-sm text-gray-600">Rastrea tu historial de órdenes</p>
            </div>
          </Link>

          <Link
            href="/account/addresses"
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
          >
            <span className="text-2xl">🏠</span>
            <div>
              <p className="font-medium text-gray-900">Gestionar Direcciones</p>
              <p className="text-sm text-gray-600">Actualiza tus direcciones de envío</p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
          >
            <span className="text-2xl">🛍️</span>
            <div>
              <p className="font-medium text-gray-900">Continuar Comprando</p>
              <p className="text-sm text-gray-600">Explora nuestros productos</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Info de la Cuenta */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Información de la Cuenta</h3>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-600">Correo Electrónico</dt>
            <dd className="mt-1 text-sm text-gray-900">{customer.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Nombre</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {customer.first_name && customer.last_name
                ? `${customer.first_name} ${customer.last_name}`
                : customer.first_name || "No establecido"}
            </dd>
          </div>
          {customer.phone && (
            <div>
              <dt className="text-sm font-medium text-gray-600">Teléfono</dt>
              <dd className="mt-1 text-sm text-gray-900">{customer.phone}</dd>
            </div>
          )}
          {customer.created_at && (
            <div>
              <dt className="text-sm font-medium text-gray-600">Miembro Desde</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(customer.created_at).toLocaleDateString("es-DO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}

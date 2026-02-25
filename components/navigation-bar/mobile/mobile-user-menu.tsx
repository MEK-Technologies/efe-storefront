"use client"

import Link from "next/link"
import { useAuth } from "hooks/useAuth"
import { useModalStore } from "stores/modal-store"
import { Button } from "components/ui/button"

interface MobileUserMenuProps {
  onClose: () => void
}

export function MobileUserMenu({ onClose }: MobileUserMenuProps) {
  const { customer, isAuthenticated, isLoading, logout } = useAuth()
  const openModal = useModalStore((s) => s.openModal)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <div className="h-10 w-full animate-pulse rounded-md bg-gray-200" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <Button
          variant="default"
          className="w-full text-base"
          onClick={() => {
            onClose()
            openModal("login")
          }}
        >
          Iniciar Sesión
        </Button>
        <Button
          variant="outline"
          className="w-full text-base"
          onClick={() => {
            onClose()
            openModal("register")
          }}
        >
          Registrarse
        </Button>
      </div>
    )
  }

  const displayName = customer?.first_name
    ? `${customer.first_name}${customer.last_name ? ` ${customer.last_name.charAt(0)}.` : ""}`
    : customer?.email?.split("@")[0] || "Cuenta"

  return (
    <div className="flex flex-col p-4">
      <div className="mb-4 border-b border-gray-100 pb-4">
        <p className="text-lg font-medium text-gray-900">Hola, {displayName}</p>
        <p className="text-sm text-gray-500">{customer?.email}</p>
      </div>

      <nav className="flex flex-col space-y-2">
        <Link
          href="/account"
          onClick={onClose}
          className="block rounded-md py-3 text-base text-gray-700 transition-colors hover:text-black"
        >
          Mi Cuenta
        </Link>
        <Link
          href="/account/orders"
          onClick={onClose}
          className="block rounded-md py-3 text-base text-gray-700 transition-colors hover:text-black"
        >
          Mis Pedidos
        </Link>
        <Link
          href="/account/addresses"
          onClick={onClose}
          className="block rounded-md py-3 text-base text-gray-700 transition-colors hover:text-black"
        >
          Direcciones
        </Link>

        <button
          onClick={() => {
            onClose()
            logout()
          }}
          className="mt-4 block w-full rounded-md py-3 text-left text-base text-red-600 transition-colors"
        >
          Cerrar Sesión
        </button>
      </nav>
    </div>
  )
}

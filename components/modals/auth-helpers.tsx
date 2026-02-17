"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useAuth } from "hooks/useAuth"
import { useModalStore } from "stores/modal-store"
import { Button } from "components/ui/button"
import { ChevronIcon } from "components/icons/chevron-icon"
import { cn } from "utils/cn"

export function AuthButton() {
  const { customer, isAuthenticated, isLoading, logout } = useAuth()
  const openModal = useModalStore((s) => s.openModal)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDropdownOpen])

  if (isLoading) {
    return (
      <div className="flex gap-2">
        <div className="h-9 w-20 animate-pulse rounded-md bg-gray-200" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openModal("login")}
          className="text-sm font-medium"
        >
          Iniciar Sesión
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => openModal("register")}
          className="text-sm font-medium"
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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
        aria-expanded={isDropdownOpen ? "true" : "false"}
        aria-haspopup="true"
      >
        <span className="max-w-[120px] truncate">{displayName}</span>
        <ChevronIcon
          className={cn("size-4 transition-transform", {
            "rotate-180": isDropdownOpen,
          })}
        />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="p-2">
            <div className="border-b border-gray-100 px-3 py-2">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">{customer?.email}</p>
            </div>

            <nav className="mt-2 space-y-1">
              <Link
                href="/account"
                onClick={() => setIsDropdownOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
              >
                Mi Cuenta
              </Link>
              <Link
                href="/account/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
              >
                Ajustes de Perfil
              </Link>
              <Link
                href="/account/orders"
                onClick={() => setIsDropdownOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
              >
                Mis Pedidos
              </Link>
              <Link
                href="/account/addresses"
                onClick={() => setIsDropdownOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
              >
                Direcciones
              </Link>

              <div className="border-t border-gray-100 pt-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false)
                    logout()
                  }}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  Cerrar Sesión
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}

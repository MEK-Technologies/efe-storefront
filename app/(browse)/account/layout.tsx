"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "hooks/useAuth"
import { cn } from "utils/cn"
import { ChevronIcon } from "components/icons/chevron-icon"

interface AccountLayoutProps {
  children: React.ReactNode
}

const accountLinks = [
  { href: "/account", label: "Dashboard", icon: "📊" },
  { href: "/account/profile", label: "Profile", icon: "👤" },
  { href: "/account/orders", label: "Orders", icon: "📦" },
  { href: "/account/addresses", label: "Addresses", icon: "📍" },
]

export default function AccountLayout({ children }: AccountLayoutProps) {
  const pathname = usePathname()
  const { logout, customer } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        {customer && (
          <p className="mt-1 text-sm text-gray-600">
            Welcome back, {customer.first_name || customer.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Mobile menu button */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left font-medium text-gray-900 shadow-sm"
            aria-expanded={isMobileMenuOpen ? ("true" as const) : ("false" as const)}
          >
            <span>Menu</span>
            <ChevronIcon
              className={cn("size-5 transition-transform", {
                "rotate-180": isMobileMenuOpen,
              })}
            />
          </button>
        </div>

        {/* Sidebar navigation */}
        <aside
          className={cn(
            "w-full space-y-1 lg:block lg:w-64",
            isMobileMenuOpen ? "block" : "hidden"
          )}
        >
          <nav className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
            {accountLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <span className="text-lg">{link.icon}</span>
                  {link.label}
                </Link>
              )
            })}

            <div className="my-2 border-t border-gray-200" />

            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <span className="text-lg">🚪</span>
              Logout
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

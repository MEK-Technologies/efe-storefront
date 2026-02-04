"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useModalStore } from "stores/modal-store"
import { AuthProvider } from "hooks/useAuth"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const openModal = useModalStore((s) => s.openModal)

  useEffect(() => {
    // Check if redirected from protected route
    if (searchParams.get("login") === "required") {
      openModal("login")
      // Clean up URL without causing navigation
      const url = new URL(window.location.href)
      url.searchParams.delete("login")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams, openModal])

  return <AuthProvider>{children}</AuthProvider>
}

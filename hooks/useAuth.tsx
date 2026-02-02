"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useModalStore } from "stores/modal-store"
import { login as loginAction, retrieveCustomer, signout, signup as signupAction } from "lib/medusa/data/customer"
import type { HttpTypes } from "@medusajs/types"

interface AuthContextType {
  customer: HttpTypes.StoreCustomer | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshCustomer: () => Promise<HttpTypes.StoreCustomer | null>
}

interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | null>(null)

const SESSION_REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const openModal = useModalStore((s) => s.openModal)
  const closeModal = useModalStore((s) => s.closeModal)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const refreshCustomer = useCallback(async () => {
    try {
      const customerData = await retrieveCustomer()
      setCustomer(customerData)
      return customerData
    } catch (error) {
      setCustomer(null)
      return null
    }
  }, [])

  // Handle session expiry and show login modal with toast
  const handleSessionExpired = useCallback(() => {
    setCustomer(null)
    toast.error("Your session expired, please login again")
    openModal("login")
    
    // Clear refresh interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
    }
  }, [openModal])

  // Periodic session refresh
  useEffect(() => {
    const startRefreshInterval = () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }

      refreshIntervalRef.current = setInterval(async () => {
        const customerData = await refreshCustomer()
        if (!customerData) {
          handleSessionExpired()
        }
      }, SESSION_REFRESH_INTERVAL)
    }

    if (customer) {
      startRefreshInterval()
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [customer, refreshCustomer, handleSessionExpired])

  // Initial customer load
  useEffect(() => {
    refreshCustomer().finally(() => setIsLoading(false))
  }, [refreshCustomer])

  const login = async (email: string, password: string) => {
    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)

      const result = await loginAction(null, formData)

      // If result is a string, it's an error message
      if (typeof result === "string") {
        throw new Error(result)
      }

      await refreshCustomer()
      closeModal("login")
      toast.success("Welcome back!")
      router.refresh()
    } catch (error: any) {
      const message = error.message || "Invalid email or password"
      toast.error(message)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("password", data.password)
      formData.append("first_name", data.first_name)
      formData.append("last_name", data.last_name)
      if (data.phone) {
        formData.append("phone", data.phone)
      }

      const result = await signupAction(null, formData)

      // If result is a string, it's an error message
      if (typeof result === "string") {
        throw new Error(result)
      }

      await refreshCustomer()
      closeModal("register")
      toast.success("Account created successfully!")
      router.refresh()
    } catch (error: any) {
      const message = error.message || "Failed to create account"
      toast.error(message)
      throw error
    }
  }

  const logout = async () => {
    try {
      // Clear customer state immediately
      setCustomer(null)
      
      // Clear refresh interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
      
      // Call server action (will redirect)
      await signout()
      
      toast.success("Logged out successfully")
    } catch (error: any) {
      // Even if server logout fails, we've cleared local state
      console.error("Logout error:", error)
      toast.success("Logged out successfully")
      router.push("/")
      router.refresh()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        customer,
        isLoading,
        isAuthenticated: !!customer,
        login,
        register,
        logout,
        refreshCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

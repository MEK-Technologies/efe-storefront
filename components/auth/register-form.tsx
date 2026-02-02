"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { useAuth } from "hooks/useAuth"
import { useModalStore } from "stores/modal-store"
import { Spinner } from "components/spinner"

const registerSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const { register: registerUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const openModal = useModalStore((s) => s.openModal)
  const closeModal = useModalStore((s) => s.closeModal)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      await registerUser(data)
    } catch (error) {
      // Error handling is done in useAuth hook with toast
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchToLogin = () => {
    closeModal("register")
    openModal("login")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            type="text"
            placeholder="John"
            autoComplete="given-name"
            disabled={isLoading}
            {...register("first_name")}
          />
          {errors.first_name && <p className="text-sm text-red-600">{errors.first_name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            type="text"
            placeholder="Doe"
            autoComplete="family-name"
            disabled={isLoading}
            {...register("last_name")}
          />
          {errors.last_name && <p className="text-sm text-red-600">{errors.last_name.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={isLoading}
          {...register("email")}
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone (Optional)</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          autoComplete="tel"
          disabled={isLoading}
          {...register("phone")}
        />
        {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password (min. 8 characters)"
          autoComplete="new-password"
          disabled={isLoading}
          {...register("password")}
        />
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Spinner className="size-4" />
            Creating account...
          </span>
        ) : (
          "Create Account"
        )}
      </Button>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <button
          type="button"
          onClick={handleSwitchToLogin}
          className="text-blue-600 hover:underline"
          disabled={isLoading}
        >
          Login
        </button>
      </div>
    </form>
  )
}

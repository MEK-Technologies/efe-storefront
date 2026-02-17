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

const loginSchema = z.object({
  email: z.string().email("Por favor ingresa un correo electrónico válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const openModal = useModalStore((s) => s.openModal)
  const closeModal = useModalStore((s) => s.closeModal)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
    } catch (error) {
      // Error handling is done in useAuth hook with toast
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchToRegister = () => {
    closeModal("login")
    openModal("register")
  }

  const handleForgotPassword = () => {
    // TODO: Implement password reset flow
    // For now, show a toast notification
    import("sonner").then(({ toast }) => {
      toast.info("¡La función de restablecimiento de contraseña estará disponible pronto!")
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@ejemplo.com"
          autoComplete="email"
          disabled={isLoading}
          {...register("email")}
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="Ingresa tu contraseña"
          autoComplete="current-password"
          disabled={isLoading}
          {...register("password")}
        />
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-blue-600 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Spinner className="size-4" />
            Iniciando sesión...
          </span>
        ) : (
          "Iniciar Sesión"
        )}
      </Button>

      <div className="text-center text-sm">
        ¿No tienes una cuenta?{" "}
        <button
          type="button"
          onClick={handleSwitchToRegister}
          className="text-blue-600 hover:underline"
          disabled={isLoading}
        >
          Crea una
        </button>
      </div>
    </form>
  )
}

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
  first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Por favor ingresa un correo electrónico válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
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
          <Label htmlFor="first_name">Nombre</Label>
          <Input
            id="first_name"
            type="text"
            placeholder="Juan"
            autoComplete="given-name"
            disabled={isLoading}
            {...register("first_name")}
          />
          {errors.first_name && <p className="text-sm text-red-600">{errors.first_name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Apellido</Label>
          <Input
            id="last_name"
            type="text"
            placeholder="Pérez"
            autoComplete="family-name"
            disabled={isLoading}
            {...register("last_name")}
          />
          {errors.last_name && <p className="text-sm text-red-600">{errors.last_name.message}</p>}
        </div>
      </div>

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
        <Label htmlFor="phone">Teléfono (Opcional)</Label>
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
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="Crea una contraseña (mín. 8 caracteres)"
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
            Creando cuenta...
          </span>
        ) : (
          "Crear Cuenta"
        )}
      </Button>

      <div className="text-center text-sm">
        ¿Ya tienes una cuenta?{" "}
        <button
          type="button"
          onClick={handleSwitchToLogin}
          className="text-blue-600 hover:underline"
          disabled={isLoading}
        >
          Iniciar Sesión
        </button>
      </div>
    </form>
  )
}

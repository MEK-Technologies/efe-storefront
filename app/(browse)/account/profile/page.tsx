"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "hooks/useAuth"
import { updateCustomer } from "lib/medusa/data/customer"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Spinner } from "components/spinner"
import { toast } from "sonner"

const profileSchema = z.object({
  first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
  email: z.string().email("Por favor, introduce un correo electrónico válido"),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { customer, refreshCustomer } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: customer?.first_name || "",
      last_name: customer?.last_name || "",
      phone: customer?.phone || "",
      email: customer?.email || "",
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      await updateCustomer({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || undefined,
      })

      await refreshCustomer()
      toast.success("¡Perfil actualizado con éxito!")
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar el perfil")
    } finally {
      setIsLoading(false)
    }
  }

  if (!customer) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ajustes del Perfil</h2>
        <p className="mt-1 text-sm text-gray-600">
          Actualiza tu información personal y detalles de contacto
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">Nombre</Label>
            <Input
              id="first_name"
              type="text"
              placeholder="John"
              autoComplete="given-name"
              disabled={isLoading}
              {...register("first_name")}
            />
            {errors.first_name && (
              <p className="text-sm text-red-600">{errors.first_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Apellido</Label>
            <Input
              id="last_name"
              type="text"
              placeholder="Doe"
              autoComplete="family-name"
              disabled={isLoading}
              {...register("last_name")}
            />
            {errors.last_name && (
              <p className="text-sm text-red-600">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            disabled
            {...register("email")}
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500">
            El correo electrónico no se puede cambiar. Contacta a soporte si necesitas actualizarlo.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Número de Teléfono (Opcional)</Label>
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

        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600">
            {isDirty ? "Tienes cambios sin guardar" : "Todos los cambios guardados"}
          </p>
          <Button type="submit" disabled={isLoading || !isDirty}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-4" />
                Guardando...
              </span>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </div>
      </form>

      {/* Account Info Section */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Detalles de la Cuenta</h3>
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-600">ID de Cliente</dt>
            <dd className="text-sm text-gray-900">{customer.id}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-600">Estado de la Cuenta</dt>
            <dd className="text-sm text-gray-900">
              <span className="inline-flex items-center gap-1 text-green-600">
                <span>✓</span> Activa
              </span>
            </dd>
          </div>
          {customer.created_at && (
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-600">Miembro Desde</dt>
              <dd className="text-sm text-gray-900">
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

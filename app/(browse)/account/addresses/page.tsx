"use client"

import { useState } from "react"
import { useAuth } from "hooks/useAuth"
import { addCustomerAddress, deleteCustomerAddress, updateCustomerAddress } from "lib/medusa/data/customer"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Spinner } from "components/spinner"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "components/ui/dialog"
import type { HttpTypes } from "@medusajs/types"

export default function AddressesPage() {
  const { customer, refreshCustomer } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<HttpTypes.StoreCustomerAddress | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleAddAddress = () => {
    setEditingAddress(null)
    setIsModalOpen(true)
  }

  const handleEditAddress = (address: HttpTypes.StoreCustomerAddress) => {
    setEditingAddress(address)
    setIsModalOpen(true)
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta dirección?")) return

    setIsDeleting(addressId)
    try {
      await deleteCustomerAddress(addressId)
      await refreshCustomer()
      toast.success("Dirección eliminada con éxito")
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar la dirección")
    } finally {
      setIsDeleting(null)
    }
  }

  if (!customer) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Cargando direcciones...</p>
      </div>
    )
  }

  const addresses = customer.addresses || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Direcciones</h2>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona tus direcciones de envío y facturación
          </p>
        </div>
        <Button onClick={handleAddAddress}>Agregar Dirección</Button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <div className="mx-auto mb-4 text-6xl">📍</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No hay direcciones guardadas</h3>
          <p className="mb-6 text-sm text-gray-600">
            Agrega una dirección para agilizar el proceso de compra
          </p>
          <Button onClick={handleAddAddress}>Agregar tu primera dirección</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="relative rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900">
                  {address.first_name} {address.last_name}
                </h3>
                {address.company && (
                  <p className="text-sm text-gray-600">{address.company}</p>
                )}
              </div>

              <address className="not-italic text-sm text-gray-700">
                <p>{address.address_1}</p>
                {address.address_2 && <p>{address.address_2}</p>}
                <p>
                  {address.city}, {address.province} {address.postal_code}
                </p>
                <p className="uppercase">{address.country_code}</p>
                {address.phone && <p className="mt-2">{address.phone}</p>}
              </address>

              <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditAddress(address)}
                  className="flex-1"
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteAddress(address.id)}
                  disabled={isDeleting === address.id}
                  className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  {isDeleting === address.id ? (
                    <Spinner className="size-4" />
                  ) : (
                    "Eliminar"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingAddress(null)
        }}
        address={editingAddress}
        onSuccess={refreshCustomer}
      />
    </div>
  )
}

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  address: HttpTypes.StoreCustomerAddress | null
  onSuccess: () => void
}

function AddressModal({ isOpen, onClose, address, onSuccess }: AddressModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: address?.first_name || "",
    last_name: address?.last_name || "",
    company: address?.company || "",
    address_1: address?.address_1 || "",
    address_2: address?.address_2 || "",
    city: address?.city || "",
    province: address?.province || "",
    postal_code: address?.postal_code || "",
    country_code: address?.country_code || "us",
    phone: address?.phone || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataObj.append(key, value)
      })

      if (address?.id) {
        formDataObj.append("addressId", address.id)
        await updateCustomerAddress({}, formDataObj)
        toast.success("Dirección actualizada con éxito")
      } else {
        await addCustomerAddress({}, formDataObj)
        toast.success("Dirección agregada con éxito")
      }

      await onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || "Error al guardar la dirección")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{address ? "Editar Dirección" : "Agregar Nueva Dirección"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Empresa (Opcional)</Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_1">Dirección Línea 1</Label>
            <Input
              id="address_1"
              name="address_1"
              value={formData.address_1}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_2">Dirección Línea 2 (Opcional)</Label>
            <Input
              id="address_2"
              name="address_2"
              value={formData.address_2}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Código Postal</Label>
              <Input
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province">Estado/Provincia</Label>
              <Input
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country_code">Código de País</Label>
              <Input
                id="country_code"
                name="country_code"
                value={formData.country_code}
                onChange={handleChange}
                required
                placeholder="us"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono (Opcional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-4" />
                  Guardando...
                </span>
              ) : address ? (
                "Actualizar Dirección"
              ) : (
                "Agregar Dirección"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

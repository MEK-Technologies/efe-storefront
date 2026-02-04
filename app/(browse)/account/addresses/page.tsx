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
    if (!confirm("Are you sure you want to delete this address?")) return

    setIsDeleting(addressId)
    try {
      await deleteCustomerAddress(addressId)
      await refreshCustomer()
      toast.success("Address deleted successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete address")
    } finally {
      setIsDeleting(null)
    }
  }

  if (!customer) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Loading addresses...</p>
      </div>
    )
  }

  const addresses = customer.addresses || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Addresses</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your shipping and billing addresses
          </p>
        </div>
        <Button onClick={handleAddAddress}>Add Address</Button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <div className="mx-auto mb-4 text-6xl">📍</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No addresses saved</h3>
          <p className="mb-6 text-sm text-gray-600">
            Add an address to speed up checkout
          </p>
          <Button onClick={handleAddAddress}>Add Your First Address</Button>
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
                  Edit
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
                    "Delete"
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
        toast.success("Address updated successfully")
      } else {
        await addCustomerAddress({}, formDataObj)
        toast.success("Address added successfully")
      }

      await onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || "Failed to save address")
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
          <DialogTitle>{address ? "Edit Address" : "Add New Address"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
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
              <Label htmlFor="last_name">Last Name</Label>
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
            <Label htmlFor="company">Company (Optional)</Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_1">Address Line 1</Label>
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
            <Label htmlFor="address_2">Address Line 2 (Optional)</Label>
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
              <Label htmlFor="city">City</Label>
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
              <Label htmlFor="postal_code">Postal Code</Label>
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
              <Label htmlFor="province">State/Province</Label>
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
              <Label htmlFor="country_code">Country Code</Label>
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
            <Label htmlFor="phone">Phone (Optional)</Label>
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
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-4" />
                  Saving...
                </span>
              ) : address ? (
                "Update Address"
              ) : (
                "Add Address"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

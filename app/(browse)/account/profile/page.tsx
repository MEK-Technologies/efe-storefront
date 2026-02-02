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
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
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
      toast.success("Profile updated successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  if (!customer) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Update your personal information and contact details
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
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
            {errors.first_name && (
              <p className="text-sm text-red-600">{errors.first_name.message}</p>
            )}
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
            {errors.last_name && (
              <p className="text-sm text-red-600">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            disabled
            {...register("email")}
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500">
            Email cannot be changed. Contact support if you need to update it.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (Optional)</Label>
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
            {isDirty ? "You have unsaved changes" : "All changes saved"}
          </p>
          <Button type="submit" disabled={isLoading || !isDirty}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-4" />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>

      {/* Account Info Section */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Account Details</h3>
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-600">Customer ID</dt>
            <dd className="text-sm text-gray-900">{customer.id}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-600">Account Status</dt>
            <dd className="text-sm text-gray-900">
              <span className="inline-flex items-center gap-1 text-green-600">
                <span>✓</span> Active
              </span>
            </dd>
          </div>
          {customer.created_at && (
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-600">Member Since</dt>
              <dd className="text-sm text-gray-900">
                {new Date(customer.created_at).toLocaleDateString("en-US", {
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

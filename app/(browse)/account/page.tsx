"use client"

import { useAuth } from "hooks/useAuth"
import Link from "next/link"

export default function AccountPage() {
  const { customer } = useAuth()

  if (!customer) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Loading your account...</p>
      </div>
    )
  }

  const stats = [
    {
      label: "Total Orders",
      value: 0, // Orders would come from separate API call
      icon: "📦",
      href: "/account/orders",
    },
    {
      label: "Saved Addresses",
      value: customer.addresses?.length || 0,
      icon: "📍",
      href: "/account/addresses",
    },
    {
      label: "Account Status",
      value: "Active",
      icon: "✅",
      href: "/account/profile",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back, {customer.first_name || "there"}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 transition-all hover:border-gray-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/account/profile"
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
          >
            <span className="text-2xl">✏️</span>
            <div>
              <p className="font-medium text-gray-900">Edit Profile</p>
              <p className="text-sm text-gray-600">Update your personal information</p>
            </div>
          </Link>

          <Link
            href="/account/orders"
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
          >
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-medium text-gray-900">View Orders</p>
              <p className="text-sm text-gray-600">Track your order history</p>
            </div>
          </Link>

          <Link
            href="/account/addresses"
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
          >
            <span className="text-2xl">🏠</span>
            <div>
              <p className="font-medium text-gray-900">Manage Addresses</p>
              <p className="text-sm text-gray-600">Update shipping addresses</p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
          >
            <span className="text-2xl">🛍️</span>
            <div>
              <p className="font-medium text-gray-900">Continue Shopping</p>
              <p className="text-sm text-gray-600">Browse our products</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Account Info */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Account Information</h3>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-600">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{customer.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {customer.first_name && customer.last_name
                ? `${customer.first_name} ${customer.last_name}`
                : customer.first_name || "Not set"}
            </dd>
          </div>
          {customer.phone && (
            <div>
              <dt className="text-sm font-medium text-gray-600">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">{customer.phone}</dd>
            </div>
          )}
          {customer.created_at && (
            <div>
              <dt className="text-sm font-medium text-gray-600">Member Since</dt>
              <dd className="mt-1 text-sm text-gray-900">
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

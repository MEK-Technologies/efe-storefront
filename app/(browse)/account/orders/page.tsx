"use client"

import { useAuth } from "hooks/useAuth"
import Link from "next/link"

export default function OrdersPage() {
  const { customer } = useAuth()

  if (!customer) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Loading orders...</p>
      </div>
    )
  }

  // Orders would be fetched from a separate API call
  // For now, show empty state
  const orders: any[] = []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
        <p className="mt-1 text-sm text-gray-600">
          View and track your order history
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <div className="mx-auto mb-4 text-6xl">📦</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No orders yet</h3>
          <p className="mb-6 text-sm text-gray-600">
            Start shopping to see your orders here
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const orderDate = new Date(order.created_at)
            const itemCount = order.items?.length || 0
            
            return (
              <div
                key={order.id}
                className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.display_id || order.id.slice(-8)}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "canceled"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      Placed on {orderDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${((order.total || 0) / 100).toFixed(2)}
                      </p>
                    </div>

                    <Link
                      href={`/account/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>

                {/* Order items preview (first 3) */}
                {order.items && order.items.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3 text-sm">
                          <span className="text-gray-600">
                            {item.quantity}x
                          </span>
                          <span className="flex-1 text-gray-900">
                            {item.title || item.variant?.title || "Product"}
                          </span>
                          <span className="font-medium text-gray-900">
                            ${((item.total || 0) / 100).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{order.items.length - 3} more {order.items.length - 3 === 1 ? "item" : "items"}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

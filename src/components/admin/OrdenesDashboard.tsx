'use client'

import React, { useEffect, useState } from 'react'
import { EstadoBadge, EstadoDistribution, OrdenStats } from './OrdenStats'

interface Orden {
  id: string
  numero_orden: number
  email: string
  estado: 'pendiente' | 'procesando' | 'completado' | 'cancelado'
  nombre_cliente?: string
  total: number
  moneda: string
  createdAt: string
}

interface DashboardStats {
  totalVentas: number
  ordenesPendientes: number
  ordenesHoy: number
  ticketPromedio: number
  moneda: string
  distribution: {
    pendiente: number
    procesando: number
    completado: number
    cancelado: number
  }
  recentOrders: Orden[]
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  
  // Get date ranges
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Fetch all orders from last 30 days
  const response = await fetch(`${baseUrl}/api/ordenes?limit=1000&sort=-createdAt`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch orders')
  }

  const data = await response.json() as { docs: Orden[] }
  const orders: Orden[] = data.docs || []

  // Calculate stats
  const last30DaysOrders = orders.filter(
    (o) => new Date(o.createdAt) >= thirtyDaysAgo
  )
  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt) >= startOfDay
  )

  const completedOrders = last30DaysOrders.filter((o) => o.estado === 'completado')
  const totalVentas = completedOrders.reduce((acc, o) => acc + o.total, 0)
  const ticketPromedio = completedOrders.length > 0 
    ? totalVentas / completedOrders.length 
    : 0

  const distribution = {
    pendiente: orders.filter((o) => o.estado === 'pendiente').length,
    procesando: orders.filter((o) => o.estado === 'procesando').length,
    completado: orders.filter((o) => o.estado === 'completado').length,
    cancelado: orders.filter((o) => o.estado === 'cancelado').length,
  }

  return {
    totalVentas,
    ordenesPendientes: distribution.pendiente,
    ordenesHoy: todayOrders.length,
    ticketPromedio,
    moneda: orders[0]?.moneda || 'DOP',
    distribution,
    recentOrders: orders.slice(0, 10),
  }
}

export function OrdenesDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const formatCurrency = (cents: number, currency: string = 'DOP') => {
    const amount = cents / 100
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">
            Error al cargar estadísticas
          </h3>
          <p className="mt-2 text-red-600 dark:text-red-300">{error}</p>
          <button
            onClick={() => {
              setLoading(true)
              setError(null)
              fetchDashboardStats()
                .then(setStats)
                .catch((err) => setError(err.message))
                .finally(() => setLoading(false))
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard de Órdenes
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Resumen de ventas y estadísticas en tiempo real
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true)
            fetchDashboardStats()
              .then(setStats)
              .catch((err) => setError(err.message))
              .finally(() => setLoading(false))
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Stats Cards */}
      <OrdenStats stats={stats} />

      {/* Distribution and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado Distribution */}
        <EstadoDistribution distribution={stats.distribution} />

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Órdenes Recientes
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30 cursor-pointer"
                    onClick={() => {
                      window.location.href = `/admin/collections/ordenes/${order.id}`
                    }}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        #{order.numero_orden}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {order.nombre_cliente || order.email}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <EstadoBadge estado={order.estado} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(order.total, order.moneda)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <a
              href="/admin/collections/ordenes"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Ver todas las órdenes →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// Default export for Payload admin component
export default OrdenesDashboard

'use client'

import React from 'react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {trend && (
            <p className={`mt-2 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              <span className="text-gray-500 dark:text-gray-400 font-normal"> vs periodo anterior</span>
            </p>
          )}
        </div>
        {icon && (
          <div className="ml-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

interface OrdenStatsProps {
  stats: {
    totalVentas: number
    ordenesPendientes: number
    ordenesHoy: number
    ticketPromedio: number
    moneda: string
  }
}

export function OrdenStats({ stats }: OrdenStatsProps) {
  const formatCurrency = (cents: number, currency: string = 'DOP') => {
    const amount = cents / 100
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Ventas"
        value={formatCurrency(stats.totalVentas, stats.moneda)}
        subtitle="Últimos 30 días"
        icon={
          <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <StatCard
        title="Órdenes Pendientes"
        value={stats.ordenesPendientes}
        subtitle="Requieren atención"
        icon={
          <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <StatCard
        title="Órdenes Hoy"
        value={stats.ordenesHoy}
        subtitle="Nuevas órdenes"
        icon={
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        }
      />
      <StatCard
        title="Ticket Promedio"
        value={formatCurrency(stats.ticketPromedio, stats.moneda)}
        subtitle="Por orden"
        icon={
          <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        }
      />
    </div>
  )
}

interface EstadoBadgeProps {
  estado: 'pendiente' | 'procesando' | 'completado' | 'cancelado'
}

export function EstadoBadge({ estado }: EstadoBadgeProps) {
  const styles = {
    pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    procesando: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    completado: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }

  const labels = {
    pendiente: 'Pendiente',
    procesando: 'Procesando',
    completado: 'Completado',
    cancelado: 'Cancelado',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[estado]}`}>
      {labels[estado]}
    </span>
  )
}

interface EstadoDistributionProps {
  distribution: {
    pendiente: number
    procesando: number
    completado: number
    cancelado: number
  }
}

export function EstadoDistribution({ distribution }: EstadoDistributionProps) {
  const total = Object.values(distribution).reduce((acc, val) => acc + val, 0)
  
  const getPercentage = (value: number) => {
    if (total === 0) return 0
    return Math.round((value / total) * 100)
  }

  const estados = [
    { key: 'pendiente', label: 'Pendiente', color: 'bg-yellow-500', value: distribution.pendiente },
    { key: 'procesando', label: 'Procesando', color: 'bg-blue-500', value: distribution.procesando },
    { key: 'completado', label: 'Completado', color: 'bg-green-500', value: distribution.completado },
    { key: 'cancelado', label: 'Cancelado', color: 'bg-red-500', value: distribution.cancelado },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Distribución por Estado
      </h3>
      
      {/* Progress bar */}
      <div className="h-4 flex rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-4">
        {estados.map((estado) => (
          <div
            key={estado.key}
            className={`${estado.color} transition-all duration-300`}
            style={{ width: `${getPercentage(estado.value)}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3">
        {estados.map((estado) => (
          <div key={estado.key} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${estado.color} mr-2`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">{estado.label}</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {estado.value} ({getPercentage(estado.value)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

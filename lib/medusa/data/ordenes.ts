"use server"

import { env } from "../../../env.mjs"
import { getAuthHeaders } from "./cookies"

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface DireccionEnvio {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  country_code: string
  postal_code: string
  phone?: string
  province?: string
  company?: string
}

export interface OrdenItemVariant {
  id: string
  sku?: string
  title?: string
}

export interface OrdenItemProduct {
  id: string
  title: string
  handle?: string
  thumbnail?: string
}

export interface OrdenItem {
  id: string
  title: string
  quantity: number
  unit_price: number
  variant?: OrdenItemVariant
  product?: OrdenItemProduct
  thumbnail?: string
}

export interface Orden {
  id: string
  numero_orden: number
  email: string
  estado: "pendiente" | "procesando" | "completado" | "cancelado"
  nombre_cliente?: string
  telefono?: string
  direccion_envio: DireccionEnvio
  items: OrdenItem[]
  subtotal: number
  total: number
  moneda: string
  created_at: string
  updated_at?: string
}

export interface OrdenListItem {
  id: string
  numero_orden: number
  email: string
  estado: "pendiente" | "procesando" | "completado" | "cancelado"
  total: number
  moneda: string
  items_count: number
  created_at: string
}

export interface CompleteOrdenResponse {
  type: "orden"
  orden: Orden
}

export interface GetOrdenResponse {
  orden: Orden
}

export interface ListOrdenesResponse {
  ordenes: OrdenListItem[]
}

// ============================================================================
// FUNCIONES DE API
// ============================================================================

/**
 * Completa un carrito y crea una orden personalizada.
 * Usa la colección de Payload en lugar del backend Medusa.
 */
export async function completeOrden(cartId: string): Promise<CompleteOrdenResponse> {
  const { createOrdenFromCart } = await import("../../payload/ordenes")
  return createOrdenFromCart(cartId)
}

/**
 * Obtiene el detalle de una orden por su ID.
 * Usa la colección de Payload en lugar del backend Medusa.
 */
export async function getOrden(ordenId: string): Promise<Orden | null> {
  const { getOrdenById } = await import("../../payload/ordenes")
  return getOrdenById(ordenId)
}

/**
 * Lista las órdenes de un cliente por su email.
 * Usa la colección de Payload en lugar del backend Medusa.
 */
export async function listOrdenesByEmail(email: string): Promise<OrdenListItem[]> {
  const { listOrdenesByEmail: listFromPayload } = await import("../../payload/ordenes")
  return listFromPayload(email)
}

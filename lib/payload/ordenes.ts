"use server"

import { getPayloadClient } from "../payload-client"
import type { Orden as OrdenType } from "../../payload-types"
import { retrieveCart } from "../medusa/data/cart"
import { randomUUID } from "crypto"

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

// ============================================================================
// FUNCIONES DE PAYLOAD
// ============================================================================

/**
 * Crea una orden desde un carrito de Medusa usando la colección de Payload.
 * @param cartId - El ID del carrito de Medusa
 * @returns Response con la orden creada
 */
export async function createOrdenFromCart(cartId: string): Promise<CompleteOrdenResponse> {
  try {
    // Obtener el carrito de Medusa con todos los detalles necesarios
    // Expandir variant.product con todos sus campos para capturar información completa
    const cart = await retrieveCart(
      cartId,
      "*items, *region, *items.product, *items.variant, *items.variant.product, *items.variant.product.collection, *items.variant.product.tags, *items.variant.product.images, +items.variant.product.description, +items.variant.product.metadata, +items.variant.sku, +items.variant.manage_inventory, +items.variant.inventory_quantity, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name, +metadata, +context"
    )

    console.log("[createOrdenFromCart] Cart retrieved with items:", {
      itemCount: cart?.items?.length || 0,
      hasMetadata: !!cart?.metadata,
      hasContext: !!(cart as any)?.context,
      firstItemSample: cart?.items?.[0] ? {
        title: cart.items[0].title,
        hasVariant: !!cart.items[0].variant,
        hasProduct: !!cart.items[0].variant?.product,
        productTitle: cart.items[0].variant?.product?.title,
        productTags: cart.items[0].variant?.product?.tags?.length || 0,
        productCollection: cart.items[0].variant?.product?.collection?.title || 'none',
      } : null
    })

    if (!cart) {
      throw new Error("Cart not found")
    }

    // Validar datos requeridos
    if (!cart.email) {
      throw new Error("Cart email is required")
    }

    if (!cart.shipping_address) {
      throw new Error("Shipping address is required")
    }

    if (!cart.items || cart.items.length === 0) {
      throw new Error("Cart must have at least one item")
    }

    // Mapear items del carrito al formato de Payload
    // Los items del carrito de Medusa vienen con: id, title, quantity, unit_price, variant_id, product_id, variant, product, thumbnail, metadata
    // IMPORTANTE: Generar UUID para cada item porque PostgreSQL requiere uuid, no ObjectId
    const items = cart.items.map((item) => {
      console.log("[createOrdenFromCart] Processing item:", {
        title: item.title,
        variant_id: item.variant?.id,
        product_id: item.variant?.product?.id,
        product_title: item.variant?.product?.title,
        product_tags_count: item.variant?.product?.tags?.length || 0,
        product_collection: item.variant?.product?.collection?.title || null,
        variant_sku: item.variant?.sku,
        has_product_metadata: !!item.variant?.product?.metadata,
      })

      const metadata = {
        product: item.variant?.product || null,
        variant: item.variant || null,
        cart_item: item.metadata || null,
      }

      console.log("[createOrdenFromCart] Item metadata prepared:", JSON.stringify(metadata).substring(0, 200))

      return {
        id: randomUUID(), // Generar UUID válido para PostgreSQL
        item_id: item.id,
        title: item.title || item.variant?.title || "Product",
        quantity: item.quantity || 1,
        unit_price: item.unit_price || 0,
        // variant viene expandido del carrito, acceder directamente a sus propiedades
        variant_id: item.variant?.id || item.variant_id || null,
        variant_title: item.variant?.title || null,
        // product viene dentro de variant expandido
        product_id: item.variant?.product?.id || item.product_id || null,
        product_handle: item.variant?.product?.handle || null,
        // thumbnail puede venir del item o del producto
        thumbnail: item.thumbnail || item.variant?.product?.thumbnail || null,
        // Guardar información completa de producto, variant y metadata en campo JSONB
        metadata,
      }
    })

    // Mapear dirección de envío - asegurar que todos los campos requeridos tengan valor
    const direccion_envio = {
      first_name: cart.shipping_address.first_name || "N/A",
      last_name: cart.shipping_address.last_name || "N/A",
      address_1: cart.shipping_address.address_1 || "",
      address_2: cart.shipping_address.address_2 || undefined,
      city: cart.shipping_address.city || "",
      province: cart.shipping_address.province || undefined,
      postal_code: cart.shipping_address.postal_code || "",
      country_code: cart.shipping_address.country_code || "DO",
      phone: cart.shipping_address.phone || undefined,
      company: cart.shipping_address.company || undefined,
    }

    // Obtener método de envío si existe
    let shipping_method: { name: string; price: number } | undefined = undefined
    if (cart.shipping_methods && cart.shipping_methods.length > 0) {
      const method = cart.shipping_methods[0]
      shipping_method = {
        name: method.name || "Standard Shipping",
        price: method.amount || 0,
      }
    }

    // Generate items summary for metadata
    const itemsSummary = cart.items.map((item) => ({
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unit_price,
      variant_id: item.variant?.id,
      product_id: item.variant?.product?.id,
      product_title: item.variant?.product?.title,
      product_collection: item.variant?.product?.collection?.title || null,
      variant_sku: item.variant?.sku,
    }))

    // Preparar datos para Payload
    // NOTA: numero_orden NO debe incluirse aquí, se genera automáticamente en beforeChange hook
    const ordenData: any = {
      id: randomUUID(),
      email: cart.email,
      cart_id: cart.id,
      nombre_cliente: `${direccion_envio.first_name} ${direccion_envio.last_name}`.trim(),
      telefono: direccion_envio.phone || null,
      direccion_envio,
      items,
      subtotal: cart.subtotal || 0,
      shipping_total: cart.shipping_total || 0,
      tax_total: cart.tax_total || 0,
      discount_total: cart.discount_total || 0,
      total: cart.total || 0,
      moneda: cart.currency_code?.toUpperCase() || "DOP",
      estado: "pendiente" as const,
      metadata: {
        ...(cart.metadata || {}),
        ...((cart as any).context || {}),
        medusa_cart_id: cart.id,
        items_summary: itemsSummary,
      },
    }

    // Solo agregar shipping_method si existe y es válido
    if (shipping_method && shipping_method.name) {
      ordenData.shipping_method = shipping_method
    }

    console.log("[createOrdenFromCart] Creating order in Payload:", {
      email: ordenData.email,
      cart_id: ordenData.cart_id,
      items_count: ordenData.items.length,
      total: ordenData.total,
      first_item_metadata_keys: ordenData.items[0]?.metadata ? Object.keys(ordenData.items[0].metadata) : [],
    })

    // Crear la orden en Payload
    const payload = await getPayloadClient()
    const createdOrden = await payload.create({
      collection: "ordenes",
      data: ordenData as any,
      draft: false,
    })

    console.log("[createOrdenFromCart] Order created successfully:", {
      id: createdOrden.id,
      numero_orden: createdOrden.numero_orden,
    })

    // Mapear respuesta al formato esperado por el frontend
    const orden: Orden = {
      id: String(createdOrden.id),
      numero_orden: Number(createdOrden.numero_orden),
      email: createdOrden.email as string,
      estado: createdOrden.estado as "pendiente" | "procesando" | "completado" | "cancelado",
      nombre_cliente: createdOrden.nombre_cliente as string | undefined,
      telefono: createdOrden.telefono as string | undefined,
      direccion_envio: createdOrden.direccion_envio as DireccionEnvio,
      items: (createdOrden.items as any[]).map((item) => ({
        id: item.item_id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        variant: item.variant_id
          ? {
              id: item.variant_id,
              sku: undefined,
              title: item.variant_title,
            }
          : undefined,
        product: item.product_id
          ? {
              id: item.product_id,
              title: item.title,
              handle: item.product_handle,
              thumbnail: item.thumbnail,
            }
          : undefined,
        thumbnail: item.thumbnail,
      })),
      subtotal: createdOrden.subtotal as number,
      total: createdOrden.total as number,
      moneda: createdOrden.moneda as string,
      created_at: createdOrden.createdAt as string,
      updated_at: createdOrden.updatedAt as string,
    }

    return {
      type: "orden" as const,
      orden,
    }
  } catch (error) {
    console.error("[createOrdenFromCart] Error creating order:", error)
    throw new Error(
      error instanceof Error ? error.message : "Failed to create order in Payload"
    )
  }
}

/**
 * Obtiene una orden por su ID desde la colección de Payload.
 * @param ordenId - El ID de la orden
 * @returns La orden si se encuentra, o null
 */
export async function getOrdenById(ordenId: string): Promise<Orden | null> {
  try {
    const payload = await getPayloadClient()

    console.log("[getOrdenById] Fetching order with ID:", ordenId)

    // Usar payload.find para mayor flexibilidad con IDs (numéricos o UUIDs)
    const result = await payload.find({
      collection: "ordenes",
      where: {
        id: {
          equals: ordenId as any,
        },
      },
      limit: 1,
    })

    const doc = result.docs[0]

    console.log("[getOrdenById] Result found:", !!doc)

    if (!doc) {
      return null
    }

    // Mapear de Payload al formato esperado
    const orden: Orden = {
      id: String(doc.id),
      numero_orden: Number(doc.numero_orden),
      email: doc.email as string,
      estado: doc.estado as "pendiente" | "procesando" | "completado" | "cancelado",
      nombre_cliente: doc.nombre_cliente as string | undefined,
      telefono: doc.telefono as string | undefined,
      direccion_envio: doc.direccion_envio as DireccionEnvio,
      items: (doc.items as any[]).map((item) => ({
        id: item.item_id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        variant: item.variant_id
          ? {
              id: item.variant_id,
              sku: undefined,
              title: item.variant_title,
            }
          : undefined,
        product: item.product_id
          ? {
              id: item.product_id,
              title: item.title,
              handle: item.product_handle,
              thumbnail: item.thumbnail,
            }
          : undefined,
        thumbnail: item.thumbnail,
      })),
      subtotal: doc.subtotal as number,
      total: doc.total as number,
      moneda: doc.moneda as string,
      created_at: doc.createdAt as string,
      updated_at: doc.updatedAt as string,
    }

    return orden
  } catch (error) {
    console.error("[getOrdenById] Error fetching order:", error)
    return null
  }
}

/**
 * Lista las órdenes de un cliente por email desde la colección de Payload.
 * @param email - El email del cliente
 * @returns Array de órdenes del cliente
 */
export async function listOrdenesByEmail(email: string): Promise<OrdenListItem[]> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: "ordenes",
      where: {
        email: {
          equals: email,
        },
      },
      sort: "-createdAt",
      limit: 1000,
    })

    // Mapear al formato de lista
    const ordenes: OrdenListItem[] = result.docs.map((orden) => ({
      id: String(orden.id),
      numero_orden: Number(orden.numero_orden),
      email: orden.email as string,
      estado: orden.estado as "pendiente" | "procesando" | "completado" | "cancelado",
      total: orden.total as number,
      moneda: orden.moneda as string,
      items_count: (orden.items as any[])?.length || 0,
      created_at: orden.createdAt as string,
    }))

    return ordenes
  } catch (error) {
    console.error("[listOrdenesByEmail] Error listing orders:", error)
    return []
  }
}

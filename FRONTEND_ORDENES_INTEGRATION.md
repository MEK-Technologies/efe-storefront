# 🛍️ Integración Frontend - Sistema de Órdenes Personalizado

## 📋 Endpoints Disponibles

### 1. Completar Carrito (Crear Orden)

```typescript
POST /store/carts/{cart_id}/complete
```

**Request:**
```bash
curl -X POST "http://localhost:9000/store/carts/cart_01ABC/complete" \
  -H "x-publishable-api-key: pk_..." \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "type": "orden",
  "orden": {
    "id": "orden_01KGJPMJHBVE4PPAN41...",
    "numero_orden": 1,
    "email": "cliente@example.com",
    "estado": "pendiente",
    "total": 5000,
    "moneda": "DOP",
    "items": [
      {
        "id": "item_01...",
        "title": "Producto Ejemplo",
        "quantity": 2,
        "unit_price": 2500,
        "variant": {...},
        "product": {...}
      }
    ],
    "direccion_envio": {
      "first_name": "Juan",
      "last_name": "Pérez",
      "address_1": "Calle Principal 123",
      "city": "Santo Domingo",
      "country_code": "do",
      "postal_code": "10000",
      "phone": "809-555-1234"
    },
    "created_at": "2026-02-03T21:30:48.748Z"
  }
}
```

### 2. Listar Órdenes por Email

```typescript
GET /store/ordenes?email={email}
```

**Request:**
```bash
curl "http://localhost:9000/store/ordenes?email=cliente@example.com" \
  -H "x-publishable-api-key: pk_..."
```

**Response:**
```json
{
  "ordenes": [
    {
      "id": "orden_01...",
      "numero_orden": 1,
      "email": "cliente@example.com",
      "estado": "pendiente",
      "total": 5000,
      "moneda": "DOP",
      "items_count": 3,
      "created_at": "2026-02-03T21:30:48.748Z"
    }
  ]
}
```

### 3. Obtener Detalle de Orden

```typescript
GET /store/ordenes/{orden_id}
```

**Request:**
```bash
curl "http://localhost:9000/store/ordenes/orden_01ABC" \
  -H "x-publishable-api-key: pk_..."
```

**Response:**
```json
{
  "orden": {
    "id": "orden_01ABC",
    "numero_orden": 1,
    "email": "cliente@example.com",
    "estado": "pendiente",
    "nombre_cliente": "Juan Pérez",
    "telefono": "809-555-1234",
    "direccion_envio": {...},
    "items": [...],
    "subtotal": 5000,
    "total": 5000,
    "moneda": "DOP",
    "created_at": "2026-02-03T21:30:48.748Z"
  }
}
```

---

## 🎨 Ejemplos de Implementación Frontend

### React/Next.js - Completar Orden

```typescript
// components/Checkout/CompleteOrderButton.tsx
'use client'

import { useState } from 'react'

export function CompleteOrderButton({ cartId }: { cartId: string }) {
  const [loading, setLoading] = useState(false)
  const [orden, setOrden] = useState(null)

  const completarOrden = async () => {
    setLoading(true)
    
    try {
      const response = await fetch(
        `http://localhost:9000/store/carts/${cartId}/complete`,
        {
          method: 'POST',
          headers: {
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_API_KEY!,
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await response.json()

      if (response.ok) {
        setOrden(data.orden)
        
        // Limpiar carrito del localStorage
        localStorage.removeItem('cart_id')
        
        // Redirigir a página de confirmación
        window.location.href = `/orden-confirmada/${data.orden.id}`
      } else {
        alert(`Error: ${data.message}`)
      }
    } catch (error) {
      console.error('Error al completar orden:', error)
      alert('Error al procesar la orden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={completarOrden}
      disabled={loading}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-400"
    >
      {loading ? 'Procesando...' : 'Completar Orden'}
    </button>
  )
}
```

### Página de Confirmación

```typescript
// app/orden-confirmada/[id]/page.tsx
import { notFound } from 'next/navigation'

async function getOrden(id: string) {
  const res = await fetch(
    `http://localhost:9000/store/ordenes/${id}`,
    {
      headers: {
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_API_KEY!,
      },
      cache: 'no-store',
    }
  )

  if (!res.ok) return null
  
  const data = await res.json()
  return data.orden
}

export default async function OrdenConfirmadaPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const orden = await getOrden(params.id)

  if (!orden) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-green-800 mb-2">
          ✅ ¡Orden Confirmada!
        </h1>
        <p className="text-green-700">
          Orden #{orden.numero_orden} - {orden.email}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Resumen de la Orden</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-600">Orden #</p>
            <p className="font-semibold">{orden.numero_orden}</p>
          </div>
          <div>
            <p className="text-gray-600">Estado</p>
            <p className="font-semibold capitalize">{orden.estado}</p>
          </div>
          <div>
            <p className="text-gray-600">Fecha</p>
            <p className="font-semibold">
              {new Date(orden.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Total</p>
            <p className="font-semibold text-xl">
              {orden.moneda} ${(orden.total / 100).toFixed(2)}
            </p>
          </div>
        </div>

        <h3 className="font-semibold mb-3">Productos</h3>
        <div className="space-y-3">
          {orden.items.map((item: any) => (
            <div key={item.id} className="flex justify-between border-b pb-3">
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-600">
                  Cantidad: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  ${((item.unit_price * item.quantity) / 100).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-3">Dirección de Envío</h3>
        <p>{orden.direccion_envio.first_name} {orden.direccion_envio.last_name}</p>
        <p>{orden.direccion_envio.address_1}</p>
        <p>
          {orden.direccion_envio.city}, {orden.direccion_envio.postal_code}
        </p>
        <p className="text-gray-600">Tel: {orden.direccion_envio.phone}</p>
      </div>
    </div>
  )
}
```

### Página de Mis Órdenes

```typescript
// app/mis-ordenes/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function MisOrdenesPage() {
  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')

  useEffect(() => {
    // Obtener email del usuario autenticado
    const userEmail = localStorage.getItem('user_email') || ''
    setEmail(userEmail)
    
    if (userEmail) {
      cargarOrdenes(userEmail)
    }
  }, [])

  const cargarOrdenes = async (userEmail: string) => {
    try {
      const response = await fetch(
        `http://localhost:9000/store/ordenes?email=${userEmail}`,
        {
          headers: {
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_API_KEY!,
          },
        }
      )

      const data = await response.json()
      setOrdenes(data.ordenes || [])
    } catch (error) {
      console.error('Error al cargar órdenes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center p-8">Cargando órdenes...</div>
  }

  if (!email) {
    return (
      <div className="text-center p-8">
        <p>Inicia sesión para ver tus órdenes</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Mis Órdenes</h1>

      {ordenes.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No tienes órdenes aún</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ordenes.map((orden: any) => (
            <Link
              key={orden.id}
              href={`/orden-confirmada/${orden.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold">
                    Orden #{orden.numero_orden}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(orden.created_at).toLocaleDateString('es-DO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {orden.items_count} producto(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">
                    {orden.moneda} ${(orden.total / 100).toFixed(2)}
                  </p>
                  <span className={`
                    inline-block mt-2 px-3 py-1 rounded-full text-sm
                    ${orden.estado === 'completado' ? 'bg-green-100 text-green-800' : ''}
                    ${orden.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${orden.estado === 'procesando' ? 'bg-blue-100 text-blue-800' : ''}
                    ${orden.estado === 'cancelado' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {orden.estado}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 🔧 Variables de Entorno (Frontend)

```env
# .env.local
NEXT_PUBLIC_MEDUSA_API_KEY=pk_tu_publishable_key_aqui
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
```

---

## 📝 Flujo Completo de Checkout

```typescript
// 1. Agregar productos al carrito (como siempre)
POST /store/carts
POST /store/carts/{id}/line-items

// 2. Agregar dirección de envío
POST /store/carts/{id}
{
  "shipping_address": {...},
  "email": "cliente@example.com"
}

// 3. Completar orden (NUEVO - sin payment)
POST /store/carts/{id}/complete
→ Retorna la orden completa

// 4. Mostrar confirmación
GET /store/ordenes/{orden_id}

// 5. Ver historial
GET /store/ordenes?email=cliente@example.com
```

---

## ✅ Ventajas de este Sistema

- ✅ No requiere configuración de pagos
- ✅ No hay validaciones de payment collection
- ✅ Órdenes completas con todos los datos
- ✅ Sistema independiente de Medusa Orders
- ✅ Fácil de integrar en cualquier frontend
- ✅ Compatible con React, Vue, Angular, etc.

**Ya está todo listo para usar en producción!** 🚀

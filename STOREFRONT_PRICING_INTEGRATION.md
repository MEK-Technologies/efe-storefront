# Integración de Precios por Customer Groups en Storefront

Este documento explica cómo integrar el sistema de precios basados en customer groups en tu aplicación de storefront (React/Next.js).

## 📋 Resumen

El backend ahora soporta precios personalizados basados en la pertenencia del customer a grupos. El sistema funciona de la siguiente manera:

- **Sin autenticación**: Los usuarios públicos ven los precios base configurados en los price lists generales
- **Con autenticación**: Los customers en grupos específicos ven precios exclusivos de su price list asociado

**Ejemplo:**
- Precio público: RD$ 1,500.00 (price list general)
- Precio grupo VIP: RD$ 1,275.00 (price list del grupo con 15% descuento)

Nota: Los precios mostrados pueden ser más altos o más bajos dependiendo del tipo de price list (sale vs override) y las reglas configuradas.

## 🏗️ Arquitectura del Backend

### Endpoint Principal: `/store/products`

El backend implementa un endpoint custom que maneja:

#### Características del Endpoint

- **Método**: `GET`
- **Ruta**: `/store/products`
- **Autenticación**: Opcional (público, pero usa el token si está presente)
- **Publishable Key**: **Requerida** en header `x-publishable-api-key`

#### Query Parameters Soportados

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `limit` | number | 20 | Cantidad de productos a retornar |
| `offset` | number | 0 | Desplazamiento para paginación |
| `category_id` | string | - | Filtrar por ID de categoría |

#### Flujo de Funcionamiento

1. **Detectar Customer (opcional)**:
   - Lee el token JWT del header `Authorization: Bearer <token>`
   - Si existe, obtiene el `customer_id` del contexto de autenticación

2. **Obtener Customer Groups**:
   - Si el customer está autenticado, consulta sus grupos usando Medusa Query
   - Usa el **primer grupo** del customer (temporal, pendiente lógica de prioridad)

3. **Fetch de Productos**:
   - Consulta productos con status `published`
   - Incluye: variants, images, options, categories, price_set_links
   - Aplica filtros (category_id si se proporciona)
   - Aplica paginación (limit/offset)

4. **Cálculo de Precios**:
   - Para cada producto, extrae los `price_set_id` de sus variantes
   - Construye contexto de pricing:
     ```typescript
     {
       currency_code: "dop", // Peso Dominicano
       customer_group_id: [customerGroupId] // Si aplica
     }
     ```
   - Llama al Pricing Module: `pricingService.calculatePrices()`
   - El Pricing Module retorna:
     - `calculated_amount`: Precio final (con descuentos de price list si aplica)
     - `original_amount`: Precio base original
     - `price_list_id`: ID del price list aplicado (si aplica)
     - `price_list_type`: Tipo de price list (sale/override)

5. **Respuesta Estructurada**:
   ```typescript
   {
     products: [...],
     count: number,
     limit: number,
     offset: number,
     has_customer_group_pricing: boolean, // true si se aplicó pricing de grupo
     customer_group_id: string | null     // ID del grupo usado
   }
   ```

#### Estructura de Precios en Variantes

Cada variante incluye:

```typescript
{
  id: "variant_xxx",
  title: "Default",
  sku: "SKU-001",
  calculated_price: {
    amount: 127500,        // RD$ 1,275.00 en centavos
    currency_code: "dop"
  },
  original_price: {
    amount: 150000,        // RD$ 1,500.00 en centavos
    currency_code: "dop"
  },
  price_list_id: "plist_xxx", // ID del price list aplicado
  price_list_type: "sale"     // o "override"
}
```

**Importante**: Los precios están en **centavos** (ej: 150000 = RD$ 1,500.00).

#### Moneda Configurada

- **Moneda**: DOP (Peso Dominicano)
- **Hardcoded** en el backend: `currency_code: "dop"`
- Para soporte multi-moneda, agregar query param `currency_code`

### Endpoint de Perfil: `/store/customer/profile`

Endpoint custom protegido que devuelve información del customer autenticado:

- **Método**: `GET`
- **Ruta**: `/store/customer/profile`
- **Autenticación**: **Requerida** (middleware protege `/store/customer/*`)
- **Respuesta incluye**:
  - Datos básicos del customer (id, email, first_name, last_name, phone)
  - **Customer Groups** con `id` y `name`

```typescript
{
  customer: {
    id: "cus_xxx",
    email: "customer@ejemplo.com",
    first_name: "Juan",
    last_name: "Pérez",
    groups: [
      {
        id: "cusgroup_xxx",
        name: "VIP"
      }
    ]
  }
}
```

## 🔑 Configuración Inicial

### Variables de Entorno

Crea o actualiza tu archivo `.env.local`:

```bash
# Backend API
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Publishable API Key (requerido para todas las llamadas al storefront)
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your_publishable_key_here
```

### Obtener Publishable API Key

**Todos los endpoints del storefront (`/store/*`) requieren un Publishable API Key**. Hay tres formas de obtenerla:

#### Opción 1: Desde el Admin Panel

1. Inicia sesión en el Admin Panel (http://localhost:9000/app)
2. Ve a **Settings** → **API Keys**
3. Copia el **Publishable Key**

#### Opción 2: Desde la Base de Datos

```bash
# Conectar a PostgreSQL
psql -h localhost -U admin -d medusa-store

# Obtener la key
SELECT token FROM api_key WHERE type = 'publishable';
```

#### Opción 3: Desde los Logs del Seed

Si ejecutaste el seed script (`npm run seed`), busca en los logs:

```
✅ Created publishable API key: pk_xxxxxxxxxxxxx
```

**Nota**: El seed script crea automáticamente una publishable key si no existe.

## 🛠️ Utilidades y Helpers

### 1. Cliente API Base

```typescript
// lib/medusa-client.ts
const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

interface FetchOptions extends RequestInit {
  token?: string
}

export async function medusaFetch(endpoint: string, options: FetchOptions = {}) {
  const { token, ...fetchOptions } = options
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-publishable-api-key': PUBLISHABLE_KEY!,
    ...fetchOptions.headers,
  }
  
  // Agregar token de autenticación si existe
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${MEDUSA_BACKEND_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }
  
  return response.json()
}
```

### 2. Hook para Productos

```typescript
// hooks/useProducts.ts
import { useState, useEffect } from 'react'
import { medusaFetch } from '@/lib/medusa-client'

interface ProductsParams {
  limit?: number
  offset?: number
  category_id?: string
}

interface Product {
  id: string
  title: string
  handle: string
  description: string
  thumbnail: string
  variants: ProductVariant[]
  // ... otros campos
}

interface ProductVariant {
  id: string
  title: string
  sku: string
  calculated_price: {
    amount: number
    currency_code: string
  } | null
  original_price: {
    amount: number
    currency_code: string
  } | null
}

interface ProductsResponse {
  products: Product[]
  count: number
  limit: number
  offset: number
  has_customer_group_pricing: boolean
  customer_group_id: string | null
}

export function useProducts(params: ProductsParams = {}, token?: string) {
  const [data, setData] = useState<ProductsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        
        // Construir query params
        const queryParams = new URLSearchParams()
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.offset) queryParams.append('offset', params.offset.toString())
        if (params.category_id) queryParams.append('category_id', params.category_id)
        
        const endpoint = `/store/products?${queryParams.toString()}`
        const response = await medusaFetch(endpoint, { token })
        
        setData(response)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [params.limit, params.offset, params.category_id, token])
  
  return { data, loading, error }
}
```

### 3. Context de Autenticación

```typescript
// context/AuthContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { medusaFetch } from '@/lib/medusa-client'

interface AuthContextType {
  token: string | null
  customer: Customer | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

interface Customer {
  id: string
  email: string
  first_name: string
  last_name: string
  groups: CustomerGroup[]
}

interface CustomerGroup {
  id: string
  name: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Cargar token desde localStorage al montar
    const storedToken = localStorage.getItem('medusa_token')
    if (storedToken) {
      setToken(storedToken)
      fetchCustomer(storedToken)
    } else {
      setLoading(false)
    }
  }, [])
  
  const fetchCustomer = async (authToken: string) => {
    try {
      const response = await medusaFetch('/store/customer/profile', {
        token: authToken,
      })
      setCustomer(response.customer)
    } catch (error) {
      console.error('Error fetching customer:', error)
      // Token inválido o expirado
      logout()
    } finally {
      setLoading(false)
    }
  }
  
  const login = async (email: string, password: string) => {
    try {
      const response = await medusaFetch('/auth/customer/emailpass', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      
      // La respuesta de Medusa devuelve { token: "..." }
      const newToken = response.token
      setToken(newToken)
      localStorage.setItem('medusa_token', newToken)
      
      await fetchCustomer(newToken)
    } catch (error) {
      throw new Error('Login failed')
    }
  }
  
  const logout = () => {
    setToken(null)
    setCustomer(null)
    localStorage.removeItem('medusa_token')
  }
  
  return (
    <AuthContext.Provider value={{ token, customer, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

## 🎨 Componentes de UI

### 1. Componente de Precio

```typescript
// components/ProductPrice.tsx
interface ProductPriceProps {
  calculatedPrice: {
    amount: number
    currency_code: string
  } | null
  originalPrice: {
    amount: number
    currency_code: string
  } | null
  hasCustomerGroupPricing: boolean
}

export function ProductPrice({ 
  calculatedPrice, 
  originalPrice,
  hasCustomerGroupPricing 
}: ProductPriceProps) {
  // Convertir de centavos a unidades completas
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
    }).format(amount)
  }
  
  // Si no hay precios configurados
  if (!calculatedPrice && !originalPrice) {
    return <span className="text-gray-500">Precio no disponible</span>
  }
  
  const currentPrice = calculatedPrice || originalPrice
  const hasDiscount = calculatedPrice && originalPrice && 
    calculatedPrice.amount < originalPrice.amount
  
  return (
    <div className="flex items-center gap-2">
      {/* Precio actual */}
      <span className="text-2xl font-bold text-gray-900">
        {formatPrice(currentPrice!.amount)}
      </span>
      
      {/* Precio original (tachado si hay descuento) */}
      {hasDiscount && (
        <span className="text-lg text-gray-500 line-through">
          {formatPrice(originalPrice.amount)}
        </span>
      )}
      
      {/* Badge de precio especial */}
      {hasCustomerGroupPricing && (
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
          Precio de grupo
        </span>
      )}
    </div>
  )
}
```

### 2. Tarjeta de Producto

```typescript
// components/ProductCard.tsx
import { ProductPrice } from './ProductPrice'
import Link from 'next/link'
import Image from 'next/image'

interface ProductCardProps {
  product: {
    id: string
    title: string
    handle: string
    thumbnail: string
    variants: Array<{
      id: string
      calculated_price: any
      original_price: any
    }>
  }
  hasCustomerGroupPricing: boolean
}

export function ProductCard({ product, hasCustomerGroupPricing }: ProductCardProps) {
  // Usar el primer variant para mostrar el precio
  const firstVariant = product.variants[0]
  
  return (
    <Link href={`/products/${product.handle}`}>
      <div className="group cursor-pointer">
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Sin imagen
            </div>
          )}
          
          {/* Badge de descuento */}
          {hasCustomerGroupPricing && 
           firstVariant?.calculated_price && 
           firstVariant?.original_price && (
            <div className="absolute top-2 right-2">
              {firstVariant.calculated_price.amount < firstVariant.original_price.amount ? (
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {Math.round(
                    ((firstVariant.original_price.amount - firstVariant.calculated_price.amount) / 
                     firstVariant.original_price.amount) * 100
                  )}% OFF
                </span>
              ) : (
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                  GRUPO
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
            {product.title}
          </h3>
          
          <ProductPrice
            calculatedPrice={firstVariant?.calculated_price}
            originalPrice={firstVariant?.original_price}
            hasCustomerGroupPricing={hasCustomerGroupPricing}
          />
        </div>
      </div>
    </Link>
  )
}
```

### 3. Lista de Productos

```typescript
// components/ProductList.tsx
'use client'

import { useProducts } from '@/hooks/useProducts'
import { useAuth } from '@/context/AuthContext'
import { ProductCard } from './ProductCard'

interface ProductListProps {
  categoryId?: string
  limit?: number
}

export function ProductList({ categoryId, limit = 20 }: ProductListProps) {
  const { token, customer } = useAuth()
  const { data, loading, error } = useProducts(
    { limit, category_id: categoryId },
    token || undefined
  )
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error al cargar productos: {error.message}</p>
      </div>
    )
  }
  
  if (!data || data.products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay productos disponibles</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Mensaje de precios especiales */}
      {data.has_customer_group_pricing && customer && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            👥 <strong>Viendo precios de grupo</strong> - Como miembro del grupo{' '}
            <strong>{customer.groups[0]?.name}</strong>, estás viendo precios exclusivos para tu grupo.
          </p>
        </div>
      )}
      
      {/* Grid de productos */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            hasCustomerGroupPricing={data.has_customer_group_pricing}
          />
        ))}
      </div>
      
      {/* Paginación (opcional) */}
      {data.count > data.limit && (
        <div className="text-center text-sm text-gray-500">
          Mostrando {data.products.length} de {data.count} productos
        </div>
      )}
    </div>
  )
}
```

### 4. Componente de Login

```typescript
// components/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await login(email, password)
      router.push('/') // Redirigir a la página principal
    } catch (err) {
      setError('Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
    </form>
  )
}
```

## 🚀 Implementación en Páginas

### Página Principal (Next.js App Router)

```typescript
// app/page.tsx
import { ProductList } from '@/components/ProductList'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Nuestros Productos</h1>
      <ProductList limit={20} />
    </div>
  )
}
```

### Layout con Provider

```typescript
// app/layout.tsx
import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

## 🎯 Casos de Uso

### 1. Mostrar Banner de Precios Especiales

```typescript
// components/CustomerGroupBanner.tsx
'use client'

import { useAuth } from '@/context/AuthContext'

export function CustomerGroupBanner() {
  const { customer } = useAuth()
  
  if (!customer || !customer.groups || customer.groups.length === 0) {
    return null
  }
  
  const groupName = customer.groups[0].name
  
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <span className="text-lg">🎁</span>
        <p className="text-sm font-medium">
          Bienvenido al grupo <strong>{groupName}</strong> - Disfruta de precios exclusivos
        </p>
      </div>
    </div>
  )
}
```

### 2. Comparador de Precios

```typescript
// components/PriceComparison.tsx
interface PriceComparisonProps {
  calculatedPrice: number
  originalPrice: number
  currency: string
}

export function PriceComparison({ 
  calculatedPrice, 
  originalPrice,
  currency 
}: PriceComparisonProps) {
  const savings = originalPrice - calculatedPrice
  const savingsPercent = Math.round((savings / originalPrice) * 100)
  
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }
  
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Precio regular:</span>
        <span className="text-sm text-gray-500 line-through">
          {formatPrice(originalPrice)}
        </span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-900">Tu precio:</span>
        <span className="text-lg font-bold text-green-600">
          {formatPrice(calculatedPrice)}
        </span>
      </div>
      
      <div className="pt-2 border-t border-green-200">
        <p className="text-sm font-medium text-green-700">
          Ahorras: {formatPrice(savings)} ({savingsPercent}%)
        </p>
      </div>
    </div>
  )
}
```

## 📊 Manejo de Estados

### Estados de Precios

```typescript
type PriceState = 
  | 'no_price'        // Sin precio configurado
  | 'base_price'      // Precio base (sin customer group)
  | 'group_price'     // Precio de customer group (igual al base)
  | 'discounted'      // Precio de customer group (con descuento)

function getPriceState(
  calculatedPrice: any,
  originalPrice: any,
  hasGroupPricing: boolean
): PriceState {
  if (!calculatedPrice && !originalPrice) return 'no_price'
  if (!hasGroupPricing) return 'base_price'
  
  if (calculatedPrice && originalPrice) {
    return calculatedPrice.amount < originalPrice.amount 
      ? 'discounted' 
      : 'group_price'
  }
  
  return 'base_price'
}

// Uso
const priceState = getPriceState(
  variant.calculated_price,
  variant.original_price,
  data.has_customer_group_pricing
)

switch (priceState) {
  case 'no_price':
    return <span>Precio no disponible</span>
  case 'base_price':
    return <span>{formatPrice(originalPrice)}</span>
  case 'group_price':
    return <span>{formatPrice(calculatedPrice)} ⭐</span>
  case 'discounted':
    return <PriceComparison {...prices} />
}
```

## ✅ Checklist de Implementación

- [ ] Configurar variables de entorno
- [ ] Implementar `medusaFetch` utility
- [ ] Crear `AuthContext` y `useAuth` hook
- [ ] Crear `useProducts` hook
- [ ] Implementar componente `ProductPrice`
- [ ] Implementar componente `ProductCard`
- [ ] Implementar componente `ProductList`
- [ ] Agregar `LoginForm`
- [ ] Agregar banner de customer group (opcional)
- [ ] Implementar paginación (opcional)
- [ ] Agregar comparador de precios (opcional)
- [ ] Testing de flujos de autenticación
- [ ] Testing de precios con y sin customer group

## 🧪 Testing

### Test Manual

1. **Sin autenticación:**
   - Navegar a la tienda
   - Verificar que se muestren precios base del price list público
   - No debe aparecer mensaje de grupo

2. **Con autenticación (customer SIN grupo):**
   - Login con customer sin grupo
   - Verificar que se muestren precios base
   - No debe aparecer mensaje de grupo

3. **Con autenticación (customer CON grupo):**
   - Login con un customer que pertenezca a un grupo (ej: VIP, Premium, Wholesale, etc.)
   - Verificar mensaje: "Viendo precios de grupo"
   - Verificar que se muestren precios del price list del grupo
   - Los precios pueden ser más altos o más bajos que los públicos

### Datos de Prueba

**Configura tus propios datos de prueba:**

```
Email: tu-email@ejemplo.com
Password: TuPasswordSeguro123
Customer ID: (generado automáticamente al crear el customer)
Customer Group: (nombre del grupo que crees, ej: vip, wholesale, premium)

Ejemplos de precios:
- Público: RD$ 1,500.00 (Producto de ejemplo)
- Grupo VIP: RD$ 1,275.00 (Producto de ejemplo con 15% descuento)
```

**Nota:** Los precios son ilustrativos. Los valores reales dependerán de tu configuración en el Admin Panel.

## 🚨 Troubleshooting

### Precios no aparecen

1. Verificar que las variantes tengan price sets configurados
2. Verificar que exista un price list activo con precios en DOP (Peso Dominicano)
3. Verificar que el price list tenga rules asociados a customer groups
4. Revisar logs del backend: buscar `[Products API]` para ver el flujo de pricing

### Error: Missing Publishable API Key

```
API Error: 401
```

**Causa**: No se incluyó el header `x-publishable-api-key` o la key es inválida.

**Solución**:
1. Verifica que `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` esté configurada
2. Asegúrate de que el header se está enviando en todas las llamadas
3. Obtén una nueva key del Admin Panel si es necesario

### Customer group no detectado

1. Verificar que el token sea válido y no haya expirado
2. Verificar que el customer esté asignado al grupo en Admin Panel
3. Revisar response de `/store/products` para `has_customer_group_pricing`
4. Consultar logs del servidor para ver: `[Products API] Customer {id} has group: {name}`

### Precios incorrectos o diferentes a los esperados

1. Verificar qué price list se está aplicando (campo `price_list_id` en la respuesta)
2. Confirmar que el customer está en el grupo correcto
3. Los precios de grupo pueden ser más altos o más bajos que los públicos (depende de la configuración)
4. Verificar currency_code: debe ser `"dop"` (Peso Dominicano) según la configuración del proyecto

### Logs útiles del backend

Busca estas líneas en los logs del servidor:

```
✅ Funcionamiento correcto:
[Products API] Customer cus_xxx has group: VIP (cusgroup_xxx)
[Products API] Calculating prices for price sets: ["pset_xxx", "pset_yyy"]
[Products API] Context: {"currency_code":"dop","customer_group_id":["cusgroup_xxx"]}

⚠️ Sin grupo:
[Products API] Customer cus_xxx has no groups - using base prices

❌ Errores:
[Products API] Error fetching customer groups: ...
[Products API] Error calculating prices for product prod_xxx: ...
```

### Token expirado

```typescript
// En AuthContext, manejar error 401
const fetchCustomer = async (authToken: string) => {
  try {
    const response = await medusaFetch('/store/customer/profile', {
      token: authToken,
    })
    setCustomer(response.customer)
  } catch (error) {
    if (error.status === 401) {
      // Token expirado
      logout()
      // Opcional: mostrar mensaje y redirigir a login
    }
  }
}
```

## 📚 Referencias

- [Backend API Documentation](./src/api/store/products/README.md)
- [Medusa Store API](https://docs.medusajs.com/api/store)
- [Customer Groups](https://docs.medusajs.com/resources/commerce-modules/customer/customer-groups)
- [Next.js Documentation](https://nextjs.org/docs)

## 💡 Mejoras Futuras

1. **Caché del lado del cliente**
   - Implementar React Query o SWR
   - Cachear productos y customer data

2. **Optimistic UI**
   - Mostrar precios inmediatamente al login
   - Revalidar en background

3. **Filtros avanzados**
   - Por rango de precio
   - Por disponibilidad
   - Por atributos de producto

4. **Wishlist con precios**
   - Guardar productos favoritos
   - Notificar cambios de precio

5. **Comparador de productos**
   - Comparar precios entre variantes
   - Mostrar mejores ofertas del grupo

---

**¿Necesitas ayuda con la implementación?** Revisa el código de ejemplo o contacta al equipo de desarrollo.

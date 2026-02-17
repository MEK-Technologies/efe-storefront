🛍️ Guía de Implementación - Endpoints de Productos en Storefront
Guía completa para integrar los endpoints de productos en tu storefront de Next.js/React.

📋 Tabla de Contenidos
Configuración Inicial
API Client
Hooks Personalizados
Componentes de UI
Páginas
Mejores Prácticas
🔧 Configuración Inicial
1. Variables de Entorno
Crea un archivo .env.local en tu storefront:

bash
# API Configuration
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_PUBLISHABLE_API_KEY=pk_5a9adcc55fdce282eeb406d68981da109220bbfd4c9f772b2fa791270301df84
2. Instalar Dependencias
bash
# Cliente HTTP
npm install axios
# o
yarn add axios
# Manejo de estado (opcional)
npm install @tanstack/react-query
# o
yarn add @tanstack/react-query
🌐 API Client
lib/api/client.ts
typescript
import axios from 'axios'
const API_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const API_KEY = process.env.NEXT_PUBLIC_PUBLISHABLE_API_KEY
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-publishable-api-key': API_KEY,
  },
})
// Interceptor para logging (opcional)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)
lib/api/products.ts
typescript
import { apiClient } from './client'
// Types
export interface ProductPrice {
  amount: number
  currency_code: string
}
export interface ProductVariant {
  id: string
  title: string
  sku: string | null
  calculated_price: ProductPrice | null
  original_price: ProductPrice | null
  price_list_id: string | null
  price_list_type: string | null
  options: Array<{
    id: string
    value: string
    option: {
      id: string
      title: string
    }
  }>
}
export interface Product {
  id: string
  title: string
  handle: string
  description: string
  subtitle: string | null
  thumbnail: string
  variants: ProductVariant[]
  images: Array<{
    id: string
    url: string
  }>
  options: Array<{
    id: string
    title: string
    values: Array<{
      id: string
      value: string
    }>
  }>
  categories: Array<{
    id: string
    name: string
    handle: string
  }>
  collection: {
    id: string
    title: string
    handle: string
  } | null
}
export interface ProductsResponse {
  products: Product[]
  count: number
  limit: number
  offset: number
  has_customer_group_pricing: boolean
  customer_group_id: string | null
}
export interface ProductResponse {
  product: Product
  has_customer_group_pricing: boolean
  customer_group_id: string | null
}
export interface VariantResponse {
  variant: ProductVariant & {
    product: Product
    inventory_items: Array<{
      id: string
      variant_id: string
    }>
  }
  has_customer_group_pricing: boolean
  customer_group_id: string | null
}
export interface SearchResponse {
  hits: any[]
  nbHits: number
  page: number
  nbPages: number
  hitsPerPage: number
  query: string
}
// API Functions
export const productsApi = {
  // GET /store/products - Lista de productos
  list: async (params?: {
    limit?: number
    offset?: number
    category_id?: string
  }): Promise<ProductsResponse> => {
    const { data } = await apiClient.get('/store/products', { params })
    return data
  },
  // GET /store/products/:id - Producto individual
  get: async (id: string): Promise<ProductResponse> => {
    const { data } = await apiClient.get(`/store/products/${id}`)
    return data
  },
  // POST /store/products/search - Búsqueda
  search: async (query: string, indexType: 'product' | 'category' = 'product'): Promise<SearchResponse> => {
    const { data } = await apiClient.post('/store/products/search', {
      query,
      indexType,
    })
    return data
  },
  // GET /store/variants/:id - Variante individual
  getVariant: async (id: string): Promise<VariantResponse> => {
    const { data } = await apiClient.get(`/store/variants/${id}`)
    return data
  },
}
🪝 Hooks Personalizados
hooks/useProducts.ts
typescript
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/products'
export const useProducts = (params?: {
  limit?: number
  offset?: number
  category_id?: string
}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.list(params),
  })
}
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(id),
    enabled: !!id,
  })
}
export const useProductSearch = (query: string) => {
  return useQuery({
    queryKey: ['product-search', query],
    queryFn: () => productsApi.search(query),
    enabled: query.length > 0,
  })
}
export const useVariant = (id: string) => {
  return useQuery({
    queryKey: ['variant', id],
    queryFn: () => productsApi.getVariant(id),
    enabled: !!id,
  })
}
🎨 Componentes de UI
components/ProductCard.tsx
typescript
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/api/products'
interface ProductCardProps {
  product: Product
}
export const ProductCard = ({ product }: ProductCardProps) => {
  // Obtener el precio más bajo de las variantes
  const lowestPrice = product.variants.reduce((min, variant) => {
    const price = variant.calculated_price?.amount || 0
    return price < min ? price : min
  }, Infinity)
  const formatPrice = (amount: number) => {
    return `RD$ ${(amount / 100).toFixed(2)}`
  }
  return (
    <Link href={`/products/${product.handle}`}>
      <div className="group cursor-pointer">
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        {/* Información */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-900">
            {product.title}
          </h3>
          
          {product.subtitle && (
            <p className="mt-1 text-sm text-gray-500">
              {product.subtitle}
            </p>
          )}
          <p className="mt-2 text-lg font-semibold text-gray-900">
            Desde {formatPrice(lowestPrice)}
          </p>
          {/* Categorías */}
          {product.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.categories.slice(0, 2).map((category) => (
                <span
                  key={category.id}
                  className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
components/ProductGrid.tsx
typescript
import { ProductCard } from './ProductCard'
import { Product } from '@/lib/api/products'
interface ProductGridProps {
  products: Product[]
  loading?: boolean
}
export const ProductGrid = ({ products, loading }: ProductGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square rounded-lg bg-gray-200" />
            <div className="mt-4 h-4 rounded bg-gray-200" />
            <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    )
  }
  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No se encontraron productos</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
components/VariantSelector.tsx
typescript
import { useState } from 'react'
import { Product, ProductVariant } from '@/lib/api/products'
interface VariantSelectorProps {
  product: Product
  onVariantChange: (variant: ProductVariant) => void
}
export const VariantSelector = ({ product, onVariantChange }: VariantSelectorProps) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  // Encontrar variante basada en opciones seleccionadas
  const findVariant = (options: Record<string, string>) => {
    return product.variants.find((variant) => {
      return variant.options.every((option) => {
        return options[option.option.id] === option.value
      })
    })
  }
  const handleOptionChange = (optionId: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionId]: value }
    setSelectedOptions(newOptions)
    const variant = findVariant(newOptions)
    if (variant) {
      onVariantChange(variant)
    }
  }
  return (
    <div className="space-y-6">
      {product.options.map((option) => (
        <div key={option.id}>
          <h3 className="text-sm font-medium text-gray-900">
            {option.title}
          </h3>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {option.values.map((value) => {
              const isSelected = selectedOptions[option.id] === value.value
              return (
                <button
                  key={value.id}
                  onClick={() => handleOptionChange(option.id, value.value)}
                  className={`
                    rounded-lg border px-4 py-2 text-sm font-medium
                    ${isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  {value.value}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
components/SearchBar.tsx
typescript
import { useState } from 'react'
import { useProductSearch } from '@/hooks/useProducts'
export const SearchBar = () => {
  const [query, setQuery] = useState('')
  const { data, isLoading } = useProductSearch(query)
  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar productos..."
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
      />
      {query && (
        <div className="absolute z-10 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Buscando...</div>
          ) : data && data.hits.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto">
              {data.hits.map((hit: any) => (
                <li
                  key={hit.objectID}
                  className="border-b border-gray-100 p-4 hover:bg-gray-50"
                >
                  <a href={`/products/${hit.handle}`}>
                    <h4 className="font-medium">{hit.title}</h4>
                    <p className="text-sm text-gray-500">{hit.description}</p>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No se encontraron resultados
            </div>
          )}
        </div>
      )}
    </div>
  )
}
📄 Páginas
app/products/page.tsx - Lista de Productos
typescript
'use client'
import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { ProductGrid } from '@/components/ProductGrid'
import { SearchBar } from '@/components/SearchBar'
export default function ProductsPage() {
  const [page, setPage] = useState(0)
  const limit = 12
  const { data, isLoading } = useProducts({
    limit,
    offset: page * limit,
  })
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Productos</h1>
        <p className="mt-2 text-gray-600">
          {data?.count || 0} productos disponibles
        </p>
      </div>
      {/* Búsqueda */}
      <div className="mb-8">
        <SearchBar />
      </div>
      {/* Grid de productos */}
      <ProductGrid products={data?.products || []} loading={isLoading} />
      {/* Paginación */}
      {data && data.count > limit && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="rounded-lg border px-4 py-2 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2">
            Página {page + 1} de {Math.ceil(data.count / limit)}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={(page + 1) * limit >= data.count}
            className="rounded-lg border px-4 py-2 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
app/products/[handle]/page.tsx - Página de Producto
typescript
'use client'
import { useState } from 'react'
import { useProduct } from '@/hooks/useProducts'
import { VariantSelector } from '@/components/VariantSelector'
import { ProductVariant } from '@/lib/api/products'
import Image from 'next/image'
export default function ProductPage({ params }: { params: { handle: string } }) {
  const { data, isLoading } = useProduct(params.handle)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Cargando...</div>
  }
  if (!data) {
    return <div className="container mx-auto px-4 py-8">Producto no encontrado</div>
  }
  const { product } = data
  const currentVariant = selectedVariant || product.variants[0]
  const formatPrice = (amount: number) => {
    return `RD$ ${(amount / 100).toFixed(2)}`
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Imágenes */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square overflow-hidden rounded-lg"
              >
                <Image
                  src={image.url}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        {/* Información */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.title}</h1>
            {product.subtitle && (
              <p className="mt-2 text-lg text-gray-600">{product.subtitle}</p>
            )}
          </div>
          {/* Precio */}
          <div className="text-2xl font-bold">
            {currentVariant.calculated_price &&
              formatPrice(currentVariant.calculated_price.amount)}
          </div>
          {/* Descripción */}
          <div className="prose">
            <p>{product.description}</p>
          </div>
          {/* Selector de variantes */}
          <VariantSelector
            product={product}
            onVariantChange={setSelectedVariant}
          />
          {/* Botón de compra */}
          <button className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
            Agregar al carrito
          </button>
          {/* Categorías */}
          {product.categories.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900">Categorías</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.categories.map((category) => (
                  <span
                    key={category.id}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
✅ Mejores Prácticas
1. Caché y Optimización
typescript
// Configurar React Query en app/providers.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
            cacheTime: 5 * 60 * 1000, // 5 minutos
          },
        },
      })
  )
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
2. Manejo de Errores
typescript
export const useProducts = (params?: any) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.list(params),
    onError: (error) => {
      console.error('Error fetching products:', error)
      // Mostrar toast o notificación al usuario
    },
  })
}
3. SEO y Metadata
typescript
// app/products/[handle]/page.tsx
import { Metadata } from 'next'
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const product = await productsApi.get(params.handle)
  
  return {
    title: product.product.title,
    description: product.product.description,
    openGraph: {
      images: [product.product.thumbnail],
    },
  }
}
4. Formateo de Precios
typescript
// lib/utils/format.ts
export const formatPrice = (amount: number, currency: string = 'DOP') => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: currency,
  }).format(amount / 100)
}
🚀 Resumen de Implementación
✅ Configurar variables de entorno
✅ Crear API client con autenticación
✅ Implementar hooks personalizados con React Query
✅ Crear componentes reutilizables
✅ Implementar páginas de productos
✅ Agregar búsqueda en tiempo real
✅ Implementar selector de variantes
✅ Optimizar con caché y SSR
¡Tu storefront está listo para usar los endpoints de productos! 🎉


Comment
Ctrl+Alt+M

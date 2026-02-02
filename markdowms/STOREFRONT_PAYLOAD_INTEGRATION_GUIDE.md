# Guía de Integración: Payload CMS para Storefront de Medusa

Esta guía explica cómo configurar un proyecto storefront de Medusa para recibir y consumir datos sincronizados desde el backend de Medusa hacia Payload CMS.

## 📋 Tabla de Contenidos

1. [Resumen de Arquitectura](#resumen-de-arquitectura)
2. [Estructura de Datos](#estructura-de-datos)
3. [Configuración de Payload CMS](#configuración-de-payload-cms)
4. [Integración con el Storefront](#integración-con-el-storefront)
5. [API Endpoints](#api-endpoints)
6. [Ejemplos de Código](#ejemplos-de-código)

---

## 🏗️ Resumen de Arquitectura

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│  Medusa Backend │──────▶│   Payload CMS    │◀──────│  Storefront     │
│  (E-commerce)   │ Sync  │  (Content Mgmt)  │ Fetch │  (Frontend)     │
└─────────────────┘       └──────────────────┘       └─────────────────┘
```

**Flujo de Datos:**
1. El backend de Medusa sincroniza productos a Payload CMS
2. El storefront consulta Payload CMS para obtener contenido enriquecido
3. Payload CMS retorna datos estructurados listos para el frontend

---

## 📦 Estructura de Datos

### Producto Sincronizado

Cuando el backend sincroniza productos a Payload, envía la siguiente estructura:

```typescript
interface PayloadProduct {
  // Identificadores y Metadata
  id: string;                    // ID generado por Payload
  medusa_id: string;             // ID del producto en Medusa
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  
  // Información Básica del Producto
  title: string;                 // Nombre del producto
  handle: string;                // Slug/URL del producto (ej: "camiseta-azul")
  subtitle?: string;             // Subtítulo opcional
  description: string;           // Descripción del producto
  
  // Opciones del Producto (ej: Color, Talla)
  options: Array<{
    medusa_id: string;           // ID de la opción en Medusa
    title: string;               // Nombre de la opción (ej: "Color", "Size")
  }>;
  
  // Variantes del Producto
  variants: Array<{
    medusa_id: string;           // ID de la variante en Medusa
    title: string;               // Título de la variante (ej: "Azul / M")
    option_values: Array<{
      medusa_id: string;         // ID del valor de opción
      medusa_option_id: string;  // ID de la opción padre
      value: string;             // Valor (ej: "Azul", "M")
    }>;
  }>;
  
  // Categorías
  categories: Array<{
    medusa_id: string;           // ID de la categoría en Medusa
    name: string;                // Nombre de la categoría
    handle: string;              // Slug de la categoría
  }>;
}
```

---

## ⚙️ Configuración de Payload CMS

### 1. Variables de Entorno

Configura las siguientes variables en tu proyecto storefront:

```bash
# .env
PAYLOAD_SERVER_URL=https://tu-payload-cms.com
PAYLOAD_API_KEY=tu-api-key-secreta
```

### 2. Colección de Productos en Payload

Tu Payload CMS debe tener una colección llamada `products` con el siguiente schema:

```typescript
// payload.config.ts
import { CollectionConfig } from 'payload/types';

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true, // Público para el storefront
  },
  fields: [
    {
      name: 'medusa_id',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'handle',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'subtitle',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'options',
      type: 'array',
      fields: [
        {
          name: 'medusa_id',
          type: 'text',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'variants',
      type: 'array',
      fields: [
        {
          name: 'medusa_id',
          type: 'text',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'option_values',
          type: 'array',
          fields: [
            {
              name: 'medusa_id',
              type: 'text',
              required: true,
            },
            {
              name: 'medusa_option_id',
              type: 'text',
              required: true,
            },
            {
              name: 'value',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'categories',
      type: 'array',
      fields: [
        {
          name: 'medusa_id',
          type: 'text',
          required: true,
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'handle',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
};
```

---

## 🔌 Integración con el Storefront

### 1. Cliente HTTP para Payload

Crea un cliente para interactuar con Payload CMS:

```typescript
// lib/payload-client.ts
export class PayloadClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.PAYLOAD_SERVER_URL!;
    this.apiKey = process.env.PAYLOAD_API_KEY!;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Payload API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Obtener todos los productos
  async getProducts(options?: {
    limit?: number;
    page?: number;
    sort?: string;
    where?: Record<string, any>;
  }) {
    const params = new URLSearchParams();
    
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.page) params.append('page', options.page.toString());
    if (options?.sort) params.append('sort', options.sort);
    if (options?.where) params.append('where', JSON.stringify(options.where));

    return this.fetch<PayloadProductsResponse>(
      `/products?${params.toString()}`
    );
  }

  // Obtener un producto por handle
  async getProductByHandle(handle: string) {
    return this.fetch<PayloadProductsResponse>(
      `/products?where[handle][equals]=${handle}&limit=1`
    );
  }

  // Obtener un producto por medusa_id
  async getProductByMedusaId(medusaId: string) {
    return this.fetch<PayloadProductsResponse>(
      `/products?where[medusa_id][equals]=${medusaId}&limit=1`
    );
  }

  // Obtener productos por categoría
  async getProductsByCategory(categoryHandle: string) {
    return this.fetch<PayloadProductsResponse>(
      `/products?where[categories.handle][equals]=${categoryHandle}`
    );
  }
}

// Tipos de respuesta
interface PayloadProductsResponse {
  docs: PayloadProduct[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

interface PayloadProduct {
  id: string;
  medusa_id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  handle: string;
  subtitle?: string;
  description: string;
  options: Array<{
    medusa_id: string;
    title: string;
  }>;
  variants: Array<{
    medusa_id: string;
    title: string;
    option_values: Array<{
      medusa_id: string;
      medusa_option_id: string;
      value: string;
    }>;
  }>;
  categories: Array<{
    medusa_id: string;
    name: string;
    handle: string;
  }>;
}
```

### 2. Servicio de Productos

Crea un servicio que combine datos de Medusa y Payload:

```typescript
// services/product-service.ts
import { PayloadClient } from '@/lib/payload-client';
import { medusaClient } from '@/lib/medusa-client'; // Tu cliente de Medusa

export class ProductService {
  private payloadClient: PayloadClient;

  constructor() {
    this.payloadClient = new PayloadClient();
  }

  /**
   * Obtiene datos completos del producto combinando Medusa y Payload
   */
  async getEnrichedProduct(handle: string) {
    // 1. Obtener datos de Payload (contenido, metadata)
    const payloadResponse = await this.payloadClient.getProductByHandle(handle);
    const payloadProduct = payloadResponse.docs[0];

    if (!payloadProduct) {
      throw new Error('Product not found in Payload');
    }

    // 2. Obtener datos de Medusa (precios, inventario, imágenes)
    const medusaProduct = await medusaClient.products.retrieve(
      payloadProduct.medusa_id
    );

    // 3. Combinar datos
    return {
      // Datos de Payload
      id: payloadProduct.medusa_id,
      title: payloadProduct.title,
      handle: payloadProduct.handle,
      subtitle: payloadProduct.subtitle,
      description: payloadProduct.description,
      options: payloadProduct.options,
      categories: payloadProduct.categories,
      
      // Datos de Medusa
      thumbnail: medusaProduct.product.thumbnail,
      images: medusaProduct.product.images,
      variants: medusaProduct.product.variants.map(v => ({
        ...v,
        // Enriquecer con datos de Payload si es necesario
        payloadData: payloadProduct.variants.find(
          pv => pv.medusa_id === v.id
        ),
      })),
    };
  }

  /**
   * Obtiene lista de productos con paginación
   */
  async getProducts(params: {
    page?: number;
    limit?: number;
    categoryHandle?: string;
  }) {
    const { page = 1, limit = 12, categoryHandle } = params;

    const options: any = { page, limit };

    if (categoryHandle) {
      options.where = {
        'categories.handle': { equals: categoryHandle },
      };
    }

    return this.payloadClient.getProducts(options);
  }
}
```

---

## 📡 API Endpoints

### Endpoints del Backend (Medusa)

#### Sincronizar Productos a Payload
```
POST /admin/payload/sync/products
Authorization: Bearer {admin_token}

Response:
{
  "message": "Synced 10 products with Payload",
  "synced": 10
}
```

### Endpoints de Payload CMS

#### Listar Productos
```
GET /api/products
Authorization: Bearer {payload_api_key}

Query Parameters:
- limit: número de resultados (default: 10)
- page: número de página (default: 1)
- sort: campo para ordenar (ej: "-createdAt")
- where: filtros en formato JSON
```

#### Obtener Producto por ID
```
GET /api/products/{id}
Authorization: Bearer {payload_api_key}
```

#### Buscar por Handle
```
GET /api/products?where[handle][equals]=mi-producto
Authorization: Bearer {payload_api_key}
```

#### Filtrar por Categoría
```
GET /api/products?where[categories.handle][equals]=electronics
Authorization: Bearer {payload_api_key}
```

---

## 💻 Ejemplos de Código

### Ejemplo 1: Página de Producto (Next.js)

```typescript
// app/products/[handle]/page.tsx
import { ProductService } from '@/services/product-service';

export default async function ProductPage({ 
  params 
}: { 
  params: { handle: string } 
}) {
  const productService = new ProductService();
  const product = await productService.getEnrichedProduct(params.handle);

  return (
    <div className="product-page">
      <h1>{product.title}</h1>
      {product.subtitle && <p className="subtitle">{product.subtitle}</p>}
      
      <div className="product-images">
        {product.images?.map((image) => (
          <img key={image.id} src={image.url} alt={product.title} />
        ))}
      </div>

      <div className="product-description">
        {product.description}
      </div>

      <div className="product-options">
        {product.options.map((option) => (
          <div key={option.medusa_id}>
            <label>{option.title}</label>
            {/* Renderizar selector de opciones */}
          </div>
        ))}
      </div>

      <div className="product-categories">
        {product.categories.map((category) => (
          <a key={category.medusa_id} href={`/category/${category.handle}`}>
            {category.name}
          </a>
        ))}
      </div>
    </div>
  );
}
```

### Ejemplo 2: Lista de Productos

```typescript
// app/products/page.tsx
import { ProductService } from '@/services/product-service';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string };
}) {
  const productService = new ProductService();
  const page = Number(searchParams.page) || 1;
  
  const { docs: products, totalPages } = await productService.getProducts({
    page,
    limit: 12,
    categoryHandle: searchParams.category,
  });

  return (
    <div className="products-grid">
      {products.map((product) => (
        <a 
          key={product.id} 
          href={`/products/${product.handle}`}
          className="product-card"
        >
          <h3>{product.title}</h3>
          <p>{product.subtitle}</p>
          <div className="categories">
            {product.categories.map((cat) => (
              <span key={cat.medusa_id}>{cat.name}</span>
            ))}
          </div>
        </a>
      ))}
      
      {/* Paginación */}
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
```

### Ejemplo 3: Hook de React para Cliente

```typescript
// hooks/usePayloadProduct.ts
'use client';

import { useState, useEffect } from 'react';
import { PayloadClient } from '@/lib/payload-client';

export function usePayloadProduct(handle: string) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const client = new PayloadClient();
        const response = await client.getProductByHandle(handle);
        setProduct(response.docs[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [handle]);

  return { product, loading, error };
}

// Uso en componente
function ProductComponent({ handle }: { handle: string }) {
  const { product, loading, error } = usePayloadProduct(handle);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Producto no encontrado</div>;

  return <div>{product.title}</div>;
}
```

---

## ✅ Checklist de Implementación

- [ ] Configurar variables de entorno de Payload
- [ ] Crear colección `products` en Payload CMS
- [ ] Implementar cliente de Payload en el storefront
- [ ] Crear servicio para combinar datos de Medusa y Payload
- [ ] Implementar páginas de productos usando datos de Payload
- [ ] Probar sincronización desde el backend
- [ ] Configurar caché para mejorar performance
- [ ] Implementar manejo de errores y fallbacks

---

## 🔄 Sincronización y Mantenimiento

### Trigger Manual de Sincronización

Puedes sincronizar productos manualmente llamando al endpoint:

```bash
curl -X POST https://tu-backend.com/admin/payload/sync/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Sincronización Automática

El backend tiene subscribers que sincronizan automáticamente cuando:
- Se crea un producto nuevo
- Se actualiza un producto
- Se eliminan productos
- Se crean/actualizan variantes
- Se modifican opciones

---

## 🚀 Optimizaciones Recomendadas

1. **Caché**: Implementa caché de respuestas de Payload (Redis/Memory)
2. **ISR/SSG**: Usa Incremental Static Regeneration en Next.js
3. **CDN**: Sirve contenido estático a través de CDN
4. **Webhooks**: Configura webhooks de Payload para invalidar caché
5. **GraphQL**: Considera usar GraphQL API de Payload para queries más eficientes

---

## 📞 Soporte

Para más información sobre:
- **Payload CMS**: https://payloadcms.com/docs
- **Medusa**: https://docs.medusajs.com
- **Integración**: Consulta el código fuente en el backend

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2026

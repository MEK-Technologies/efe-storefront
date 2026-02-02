# Ejemplos de Implementación para Payload CMS

Este documento contiene ejemplos de código específicos para implementar las colecciones en Payload CMS que recibirán datos del proyecto MedusaJS.

## Estructura de Archivos Recomendada

```
payload-project/
├── src/
│   └── collections/
│       ├── Products.ts
│       ├── Categories.ts
│       └── Collections.ts
└── payload.config.ts
```

---

## 1. Colección de Productos (`Products.ts`)

```typescript
import { CollectionConfig } from 'payload/types'

const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'handle', 'medusa_id', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req }) => {
      // Permitir creación desde Medusa o usuarios autenticados
      return req.query?.is_from_medusa === 'true' || !!req.user
    },
    update: ({ req }) => {
      return req.query?.is_from_medusa === 'true' || !!req.user
    },
    delete: ({ req }) => {
      return req.query?.is_from_medusa === 'true' || !!req.user
    },
  },
  fields: [
    // Campo crítico: ID de Medusa
    {
      name: 'medusa_id',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'ID único del producto en MedusaJS',
        readOnly: true,
      },
    },
    
    // Campos básicos
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Título del producto',
      },
    },
    {
      name: 'handle',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Slug único del producto (usado en URLs)',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      required: false,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
      admin: {
        description: 'Descripción completa del producto',
      },
    },
    
    // Timestamps (Payload los maneja automáticamente, pero aceptamos los valores)
    {
      name: 'createdAt',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'updatedAt',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    
    // Categorías como array anidado
    {
      name: 'categories',
      type: 'array',
      required: false,
      admin: {
        description: 'Categorías del producto (anidadas desde Medusa)',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'medusa_id',
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
    
    // Colección como relación (RECOMENDADO)
    {
      name: 'collection',
      type: 'relationship',
      relationTo: 'collections',
      required: false,
      admin: {
        description: 'Colección a la que pertenece el producto',
      },
      // Si prefieres objeto anidado en lugar de relación:
      // type: 'group',
      // fields: [
      //   { name: 'title', type: 'text', required: true },
      //   { name: 'medusa_id', type: 'text', required: true },
      //   { name: 'handle', type: 'text', required: true },
      // ],
    },
    
    // Opciones del producto
    {
      name: 'options',
      type: 'array',
      required: false,
      admin: {
        description: 'Opciones del producto (ej: Talla, Color)',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'medusa_id',
          type: 'text',
          required: true,
        },
      ],
    },
    
    // Variantes del producto
    {
      name: 'variants',
      type: 'array',
      required: false,
      admin: {
        description: 'Variantes del producto',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'medusa_id',
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
              required: false,
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
  ],
  
  // Hooks para manejar sincronización desde Medusa
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        // Si viene de Medusa, aplicar validaciones específicas
        if (req.query?.is_from_medusa === 'true') {
          // Asegurar que description tenga un valor por defecto si viene vacío
          if (!data.description) {
            data.description = ''
          }
        }
        return data
      },
    ],
    
    beforeChange: [
      async ({ data, req, operation }) => {
        // Si viene de Medusa y es una operación de creación
        if (req.query?.is_from_medusa === 'true' && operation === 'create' && data.medusa_id) {
          // Buscar si ya existe un producto con este medusa_id
          const existing = await req.payload.find({
            collection: 'products',
            where: {
              medusa_id: {
                equals: data.medusa_id,
              },
            },
            limit: 1,
          })
          
          // Si existe, cambiar la operación a update
          if (existing.docs.length > 0) {
            data.id = existing.docs[0].id
            // Payload automáticamente hará update si hay id
          }
        }
        return data
      },
    ],
    
    afterChange: [
      async ({ doc, req }) => {
        // Log de sincronización exitosa
        if (req.query?.is_from_medusa === 'true') {
          console.log(`[Payload] Product synced: ${doc.medusa_id} -> ${doc.id}`)
        }
      },
    ],
  },
  
  // Índices para mejorar performance
  indexes: [
    {
      fields: ['medusa_id'],
      unique: true,
    },
    {
      fields: ['handle'],
      unique: true,
    },
    // Índice para búsquedas en arrays anidados (depende de tu DB)
    // MongoDB soporta esto nativamente
    // PostgreSQL requiere GIN indexes
  ],
}

export default Products
```

---

## 2. Colección de Categorías (`Categories.ts`)

```typescript
import { CollectionConfig } from 'payload/types'

const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'handle', 'medusa_id', 'is_active', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req }) => {
      return req.query?.is_from_medusa === 'true' || !!req.user
    },
    update: ({ req }) => {
      return req.query?.is_from_medusa === 'true' || !!req.user
    },
    delete: ({ req }) => {
      return req.query?.is_from_medusa === 'true' || !!req.user
    },
  },
  fields: [
    {
      name: 'medusa_id',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'ID único de la categoría en MedusaJS',
        readOnly: true,
      },
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
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'is_internal',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'rank',
      type: 'number',
      required: false,
      admin: {
        description: 'Orden de visualización',
      },
    },
    {
      name: 'parent_category',
      type: 'relationship',
      relationTo: 'categories',
      required: false,
      admin: {
        description: 'Categoría padre (para jerarquías)',
      },
    },
    {
      name: 'parent_category_id',
      type: 'text',
      required: false,
      admin: {
        description: 'ID de Medusa de la categoría padre',
      },
    },
    {
      name: 'createdAt',
      type: 'date',
      required: true,
    },
    {
      name: 'updatedAt',
      type: 'date',
      required: true,
    },
  ],
  
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (req.query?.is_from_medusa === 'true' && operation === 'create' && data.medusa_id) {
          const existing = await req.payload.find({
            collection: 'categories',
            where: {
              medusa_id: {
                equals: data.medusa_id,
              },
            },
            limit: 1,
          })
          
          if (existing.docs.length > 0) {
            data.id = existing.docs[0].id
          }
        }
        return data
      },
    ],
  },
  
  indexes: [
    {
      fields: ['medusa_id'],
      unique: true,
    },
    {
      fields: ['handle'],
      unique: true,
    },
  ],
}

export default Categories
```

---

## 3. Colección de Colecciones (`Collections.ts`)

```typescript
import { CollectionConfig } from 'payload/types'

const Collections: CollectionConfig = {
  slug: 'collections',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'handle', 'medusa_id', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req }) => {
      return req.query?.is_from_medusa === 'true' || !!req.user
    },
    update: ({ req }) => {
      return req.query?.is_from_medusa === 'true' || !!req.user
    },
    delete: ({ req }) => {
      return req.query?.is_from_medusa === 'true' || !!req.user
    },
  },
  fields: [
    {
      name: 'medusa_id',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'ID único de la colección en MedusaJS',
        readOnly: true,
      },
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
    },
    {
      name: 'metadata',
      type: 'json',
      required: false,
      admin: {
        description: 'Metadatos adicionales de la colección',
      },
    },
    {
      name: 'createdAt',
      type: 'date',
      required: true,
    },
    {
      name: 'updatedAt',
      type: 'date',
      required: true,
    },
  ],
  
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (req.query?.is_from_medusa === 'true' && operation === 'create' && data.medusa_id) {
          const existing = await req.payload.find({
            collection: 'collections',
            where: {
              medusa_id: {
                equals: data.medusa_id,
              },
            },
            limit: 1,
          })
          
          if (existing.docs.length > 0) {
            data.id = existing.docs[0].id
          }
        }
        return data
      },
    ],
  },
  
  indexes: [
    {
      fields: ['medusa_id'],
      unique: true,
    },
    {
      fields: ['handle'],
      unique: true,
    },
  ],
}

export default Collections
```

---

## 4. Configuración de Payload (`payload.config.ts`)

```typescript
import { buildConfig } from 'payload/config'
import Products from './src/collections/Products'
import Categories from './src/collections/Categories'
import Collections from './src/collections/Collections'

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:8000',
  collections: [
    Products,
    Categories,
    Collections,
    // ... otras colecciones
  ],
  
  // Configuración de autenticación
  auth: {
    // Tu configuración de autenticación
  },
  
  // Configuración de base de datos
  db: {
    // Tu configuración de base de datos
  },
  
  // Configuración de API
  cors: [
    process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000',
  ].filter(Boolean),
  
  csrf: [
    process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000',
  ].filter(Boolean),
  
  // Endpoints personalizados (opcional)
  endpoints: [
    {
      path: '/health',
      method: 'get',
      handler: async (req, res) => {
        res.status(200).json({ status: 'ok' })
      },
    },
  ],
  
  // Plugins adicionales
  plugins: [
    // Tus plugins
  ],
})
```

---

## 5. Middleware para Validar `is_from_medusa`

```typescript
// src/middleware/validateMedusaSync.ts
import { PayloadRequest } from 'payload/types'

export const validateMedusaSync = (req: PayloadRequest, res: any, next: any) => {
  // Si el query param is_from_medusa está presente, validar API key
  if (req.query?.is_from_medusa === 'true') {
    const apiKey = req.headers.authorization?.replace(/^.*API-Key\s+/, '')
    
    if (!apiKey || apiKey !== process.env.PAYLOAD_API_KEY) {
      return res.status(401).json({
        errors: [
          {
            message: 'Invalid API key for Medusa sync',
            field: 'authorization',
          },
        ],
        message: 'Unauthorized',
      })
    }
  }
  
  next()
}
```

---

## 6. Hook Global para Upsert por `medusa_id`

```typescript
// src/hooks/medusaUpsert.ts
import { CollectionBeforeChangeHook } from 'payload/types'

export const medusaUpsertHook: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  collection,
}) => {
  // Solo aplicar si viene de Medusa y tiene medusa_id
  if (
    req.query?.is_from_medusa === 'true' &&
    operation === 'create' &&
    data.medusa_id
  ) {
    // Buscar item existente por medusa_id
    const existing = await req.payload.find({
      collection: collection.config.slug,
      where: {
        medusa_id: {
          equals: data.medusa_id,
        },
      },
      limit: 1,
    })
    
    // Si existe, cambiar a update
    if (existing.docs.length > 0) {
      const existingDoc = existing.docs[0]
      
      // Preservar el ID de Payload
      data.id = existingDoc.id
      
      // Preservar createdAt original si existe
      if (existingDoc.createdAt && !data.createdAt) {
        data.createdAt = existingDoc.createdAt
      }
      
      // Marcar como update
      operation = 'update'
    }
  }
  
  return data
}
```

**Uso en colecciones:**

```typescript
import { medusaUpsertHook } from '../hooks/medusaUpsert'

const Products: CollectionConfig = {
  // ... otros campos
  hooks: {
    beforeChange: [
      medusaUpsertHook,
      // ... otros hooks
    ],
  },
}
```

---

## 7. Validación de Datos con Zod (Opcional)

```typescript
// src/validations/productSchema.ts
import { z } from 'zod'

export const productSchema = z.object({
  medusa_id: z.string().min(1),
  title: z.string().min(1),
  handle: z.string().min(1).regex(/^[a-z0-9-]+$/),
  subtitle: z.string().optional(),
  description: z.string().default(''),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  categories: z.array(
    z.object({
      name: z.string(),
      medusa_id: z.string(),
      handle: z.string(),
    })
  ).optional(),
  collection: z.string().optional(), // ID de la colección
  options: z.array(
    z.object({
      title: z.string(),
      medusa_id: z.string(),
    })
  ).optional(),
  variants: z.array(
    z.object({
      title: z.string(),
      medusa_id: z.string(),
      option_values: z.array(
        z.object({
          medusa_id: z.string(),
          medusa_option_id: z.string().optional(),
          value: z.string(),
        })
      ),
    })
  ).optional(),
})

// Hook de validación
export const validateProductData = async ({ data, req }: any) => {
  if (req.query?.is_from_medusa === 'true') {
    try {
      productSchema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
        )
      }
      throw error
    }
  }
  return data
}
```

---

## 8. Manejo de Relaciones: Colección en Productos

Si decides usar relaciones en lugar de objetos anidados, aquí está cómo manejar la sincronización:

```typescript
// Hook para resolver relación de colección
const resolveCollectionRelation: CollectionBeforeChangeHook = async ({
  data,
  req,
}) => {
  if (req.query?.is_from_medusa === 'true' && data.collection) {
    // Si collection viene como objeto con medusa_id
    if (typeof data.collection === 'object' && data.collection.medusa_id) {
      // Buscar la colección por medusa_id
      const collection = await req.payload.find({
        collection: 'collections',
        where: {
          medusa_id: {
            equals: data.collection.medusa_id,
          },
        },
        limit: 1,
      })
      
      if (collection.docs.length > 0) {
        // Reemplazar con el ID de Payload
        data.collection = collection.docs[0].id
      } else {
        // Si no existe, crear la colección primero
        const newCollection = await req.payload.create({
          collection: 'collections',
          data: {
            medusa_id: data.collection.medusa_id,
            title: data.collection.title,
            handle: data.collection.handle,
            createdAt: data.collection.createdAt || new Date().toISOString(),
            updatedAt: data.collection.updatedAt || new Date().toISOString(),
          },
        })
        data.collection = newCollection.id
      }
    }
    // Si collection viene como string (medusa_id), buscar y convertir
    else if (typeof data.collection === 'string') {
      const collection = await req.payload.find({
        collection: 'collections',
        where: {
          medusa_id: {
            equals: data.collection,
          },
        },
        limit: 1,
      })
      
      if (collection.docs.length > 0) {
        data.collection = collection.docs[0].id
      } else {
        // Si no existe, eliminar la referencia
        delete data.collection
      }
    }
  }
  
  return data
}
```

---

## 9. Testing de la Sincronización

```typescript
// tests/sync.test.ts
import { getPayload } from 'payload'
import configPromise from '../payload.config'

describe('Medusa Sync', () => {
  let payload: any
  
  beforeAll(async () => {
    payload = await getPayload({ config: configPromise })
  })
  
  it('should create product from Medusa', async () => {
    const productData = {
      medusa_id: 'test_prod_123',
      title: 'Test Product',
      handle: 'test-product',
      description: 'Test description',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categories: [
        {
          name: 'Test Category',
          medusa_id: 'test_cat_123',
          handle: 'test-category',
        },
      ],
    }
    
    const result = await payload.create({
      collection: 'products',
      data: productData,
      req: {
        query: { is_from_medusa: 'true' },
        headers: {
          authorization: `users API-Key ${process.env.PAYLOAD_API_KEY}`,
        },
      } as any,
    })
    
    expect(result.doc.medusa_id).toBe('test_prod_123')
    expect(result.doc.title).toBe('Test Product')
  })
  
  it('should update existing product by medusa_id', async () => {
    // Crear producto primero
    const created = await payload.create({
      collection: 'products',
      data: {
        medusa_id: 'test_prod_456',
        title: 'Original Title',
        handle: 'original-handle',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      req: {
        query: { is_from_medusa: 'true' },
      } as any,
    })
    
    // Intentar crear de nuevo con mismo medusa_id pero datos diferentes
    const updated = await payload.create({
      collection: 'products',
      data: {
        medusa_id: 'test_prod_456',
        title: 'Updated Title',
        handle: 'updated-handle',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      req: {
        query: { is_from_medusa: 'true' },
      } as any,
    })
    
    expect(updated.doc.id).toBe(created.doc.id)
    expect(updated.doc.title).toBe('Updated Title')
  })
})
```

---

## Resumen de Puntos Clave

1. **`medusa_id` es el identificador único** - Úsalo para upsert
2. **`is_from_medusa=true`** debe estar en query params para permitir sincronización
3. **Arrays anidados** deben aceptarse como están (categories, options, variants)
4. **Relaciones** pueden resolverse automáticamente usando hooks
5. **Timestamps** (`createdAt`, `updatedAt`) deben aceptarse desde Medusa
6. **Validaciones** deben ser flexibles para datos de sincronización
7. **Upsert por `medusa_id`** es crítico para evitar duplicados

---

## Próximos Pasos

1. Implementa las tres colecciones (Products, Categories, Collections)
2. Configura los hooks de upsert
3. Prueba la sincronización con datos de prueba
4. Configura índices en la base de datos
5. Implementa monitoreo y logging
6. Documenta cualquier customización adicional

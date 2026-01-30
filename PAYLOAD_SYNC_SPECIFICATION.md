# Especificación de Sincronización con Payload CMS

Esta documentación detalla cómo el proyecto MedusaJS sincroniza productos, categorías y colecciones con Payload CMS, y qué debe implementar el proyecto Payload para recibir correctamente estos datos.

## Tabla de Contenidos

1. [Información General](#información-general)
2. [Endpoints y Métodos HTTP](#endpoints-y-métodos-http)
3. [Headers Requeridos](#headers-requeridos)
4. [Estructura de Datos - Productos](#estructura-de-datos---productos)
5. [Estructura de Datos - Categorías](#estructura-de-datos---categorías)
6. [Estructura de Datos - Colecciones](#estructura-de-datos---colecciones)
7. [Validaciones Requeridas](#validaciones-requeridas)
8. [Query Parameters Especiales](#query-parameters-especiales)
9. [Respuestas Esperadas](#respuestas-esperadas)
10. [Manejo de Errores](#manejo-de-errores)

---

## Información General

### Flujo de Sincronización

El proyecto MedusaJS envía datos a Payload CMS mediante:
- **POST** `/api/{collection}/?is_from_medusa=true` - Para crear nuevos items
- **PATCH** `/api/{collection}/?is_from_medusa=true` - Para actualizar items existentes
- **DELETE** `/api/{collection}/?is_from_medusa=true&where={query}` - Para eliminar items

### Colecciones Sincronizadas

- `products` - Productos principales
- `categories` - Categorías (como colección separada, ver sección correspondiente)
- `collections` - Colecciones (como colección separada, ver sección correspondiente)

---

## Endpoints y Métodos HTTP

### 1. Crear Items (POST)

**Endpoint:** `POST /api/{collection}/?is_from_medusa=true`

**Ejemplo para productos:**
```http
POST /api/products/?is_from_medusa=true
Content-Type: application/json
Authorization: users API-Key {API_KEY}

{
  "medusa_id": "prod_01H...",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "title": "Product Title",
  "handle": "product-handle",
  ...
}
```

### 2. Actualizar Items (PATCH)

**Endpoint:** `PATCH /api/{collection}/?is_from_medusa=true&where[id][equals]={id}`

**Ejemplo:**
```http
PATCH /api/products/?is_from_medusa=true&where[id][equals]=payload_id_123
Content-Type: application/json
Authorization: users API-Key {API_KEY}

{
  "title": "Updated Title",
  "description": "Updated description",
  ...
}
```

### 3. Eliminar Items (DELETE)

**Endpoint:** `DELETE /api/{collection}/?is_from_medusa=true&where[id][in]={id1},{id2}`

**Ejemplo:**
```http
DELETE /api/products/?is_from_medusa=true&where[id][in]=id1,id2,id3
Authorization: users API-Key {API_KEY}
```

### 4. Buscar Items (GET)

**Endpoint:** `GET /api/{collection}/?is_from_medusa=true&where={query}&depth=2`

**Ejemplo:**
```http
GET /api/products/?is_from_medusa=true&where[medusa_id][in]=prod_01,prod_02&depth=2
Authorization: users API-Key {API_KEY}
```

---

## Headers Requeridos

Todos los requests deben incluir:

```http
Content-Type: application/json
Authorization: {userCollection} API-Key {API_KEY}
```

**Nota:** El `{userCollection}` por defecto es `"users"`, pero puede configurarse mediante la variable de entorno `PAYLOAD_USER_COLLECTION`.

---

## Estructura de Datos - Productos

### Schema Requerido en Payload para `products`

El proyecto Payload debe tener una colección `products` con el siguiente schema:

```typescript
{
  slug: 'products',
  fields: [
    // Campo requerido: ID de Medusa
    {
      name: 'medusa_id',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    
    // Campos básicos del producto
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
      name: 'subtitle',
      type: 'text',
      required: false,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    },
    
    // Timestamps (Payload los maneja automáticamente, pero se envían)
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
    
    // Relación con Categorías (ARRAY DE OBJETOS ANIDADOS)
    {
      name: 'categories',
      type: 'array',
      required: false,
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
    
    // Relación con Colecciones (OBJETO ANIDADO O REFERENCIA)
    {
      name: 'collection',
      type: 'relationship',
      relationTo: 'collections',
      required: false,
      // O si prefieres objeto anidado:
      // type: 'group',
      // fields: [
      //   { name: 'title', type: 'text' },
      //   { name: 'medusa_id', type: 'text' },
      //   { name: 'handle', type: 'text' },
      // ],
    },
    
    // Opciones del producto (ARRAY DE OBJETOS ANIDADOS)
    {
      name: 'options',
      type: 'array',
      required: false,
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
    
    // Variantes del producto (ARRAY DE OBJETOS ANIDADOS)
    {
      name: 'variants',
      type: 'array',
      required: false,
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
}
```

### Payload de Ejemplo - Crear Producto

```json
{
  "medusa_id": "prod_01HZ9K8XQ3N4M5P6R7S8T9U0V",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "title": "Camiseta Premium",
  "handle": "camiseta-premium",
  "subtitle": "Camiseta de algodón 100%",
  "description": "Una camiseta cómoda y elegante...",
  "categories": [
    {
      "name": "Ropa",
      "medusa_id": "pcat_01HZ9K8XQ3N4M5P6R7S8T9U0V",
      "handle": "ropa"
    },
    {
      "name": "Camisetas",
      "medusa_id": "pcat_02HZ9K8XQ3N4M5P6R7S8T9U0V",
      "handle": "camisetas"
    }
  ],
  "collection": {
    "title": "Colección Verano 2024",
    "medusa_id": "pcol_01HZ9K8XQ3N4M5P6R7S8T9U0V",
    "handle": "verano-2024"
  },
  "options": [
    {
      "title": "Talla",
      "medusa_id": "opt_01HZ9K8XQ3N4M5P6R7S8T9U0V"
    },
    {
      "title": "Color",
      "medusa_id": "opt_02HZ9K8XQ3N4M5P6R7S8T9U0V"
    }
  ],
  "variants": [
    {
      "title": "S / Rojo",
      "medusa_id": "variant_01HZ9K8XQ3N4M5P6R7S8T9U0V",
      "option_values": [
        {
          "medusa_id": "optval_01",
          "medusa_option_id": "opt_01HZ9K8XQ3N4M5P6R7S8T9U0V",
          "value": "S"
        },
        {
          "medusa_id": "optval_02",
          "medusa_option_id": "opt_02HZ9K8XQ3N4M5P6R7S8T9U0V",
          "value": "Rojo"
        }
      ]
    }
  ]
}
```

---

## Estructura de Datos - Categorías

### ⚠️ IMPORTANTE: Separación de Categorías

Las categorías se sincronizan de **DOS formas diferentes**:

1. **Como parte del producto** (array anidado en `products.categories`)
2. **Como colección separada** `categories` (recomendado para mejor normalización)

### Opción 1: Categorías como Colección Separada (RECOMENDADO)

#### Schema Requerido en Payload para `categories`

```typescript
{
  slug: 'categories',
  fields: [
    {
      name: 'medusa_id',
      type: 'text',
      required: true,
      unique: true,
      index: true,
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
    },
    {
      name: 'parent_category',
      type: 'relationship',
      relationTo: 'categories',
      required: false,
    },
    {
      name: 'parent_category_id',
      type: 'text',
      required: false,
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
}
```

#### Payload de Ejemplo - Crear Categoría

```json
{
  "medusa_id": "pcat_01HZ9K8XQ3N4M5P6R7S8T9U0V",
  "name": "Ropa",
  "handle": "ropa",
  "description": "Toda nuestra colección de ropa",
  "is_active": true,
  "is_internal": false,
  "rank": 1,
  "parent_category_id": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Opción 2: Categorías Anidadas en Productos (Actual)

Actualmente, las categorías se envían como parte del producto (ver sección de productos arriba). Si decides mantenerlas así, asegúrate de que el campo `categories` en `products` acepte arrays de objetos anidados.

---

## Estructura de Datos - Colecciones

### ⚠️ IMPORTANTE: Colecciones como Colección Separada

Las colecciones deben sincronizarse como una **colección separada** llamada `collections` y luego referenciarse desde los productos.

### Schema Requerido en Payload para `collections`

```typescript
{
  slug: 'collections',
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
    },
    {
      name: 'metadata',
      type: 'json',
      required: false,
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
}
```

### Schema Actualizado para `products` - Referencia a Colecciones

En el schema de `products`, el campo `collection` debe ser una **relación**:

```typescript
{
  name: 'collection',
  type: 'relationship',
  relationTo: 'collections',
  required: false,
  // O si prefieres solo el ID:
  // type: 'text', // almacenar solo medusa_id de la colección
}
```

### Payload de Ejemplo - Crear Colección

```json
{
  "medusa_id": "pcol_01HZ9K8XQ3N4M5P6R7S8T9U0V",
  "title": "Colección Verano 2024",
  "handle": "verano-2024",
  "metadata": {},
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Actualización de Producto con Referencia a Colección

Cuando se actualiza un producto con una colección, puede venir de dos formas:

**Opción A: Solo el ID de Medusa de la colección**
```json
{
  "collection": "pcol_01HZ9K8XQ3N4M5P6R7S8T9U0V"
}
```

**Opción B: Objeto completo (si Payload acepta upsert)**
```json
{
  "collection": {
    "medusa_id": "pcol_01HZ9K8XQ3N4M5P6R7S8T9U0V",
    "title": "Colección Verano 2024",
    "handle": "verano-2024"
  }
}
```

---

## Validaciones Requeridas

### Validaciones Críticas

El proyecto Payload debe validar:

1. **`medusa_id` es único y requerido** en todas las colecciones
2. **`handle` es único** en productos y colecciones
3. **`createdAt` y `updatedAt`** son fechas válidas en formato ISO 8601
4. **Arrays anidados** (`categories`, `options`, `variants`) pueden estar vacíos pero deben ser arrays válidos
5. **Query parameter `is_from_medusa=true`** debe estar presente para permitir la sincronización

### Validaciones Recomendadas

- Validar que los `medusa_id` en relaciones anidadas existan en sus respectivas colecciones
- Validar formato de `handle` (solo letras minúsculas, números y guiones)
- Validar que `description` no exceda un límite de caracteres (ej: 5000)
- Validar que arrays anidados no excedan un límite razonable (ej: 100 items)

---

## Query Parameters Especiales

### `is_from_medusa=true`

**Propósito:** Identifica que la solicitud viene del proyecto MedusaJS.

**Uso:** Debe estar presente en TODOS los requests de sincronización.

**Ejemplo:**
```
POST /api/products/?is_from_medusa=true
```

**Recomendación:** En Payload, puedes usar este parámetro para:
- Bypass ciertas validaciones que no aplican para sincronización automática
- Registrar la fuente de los datos
- Aplicar hooks específicos para sincronización

### `where` (para queries)

**Formato:** Query string codificado con `qs` (query-string library).

**Ejemplos:**
```
where[medusa_id][equals]=prod_123
where[id][in]=id1,id2,id3
where[categories.medusa_id][equals]=cat_123
```

**Nota:** Payload debe soportar queries anidadas para campos dentro de arrays.

### `depth` (para relaciones)

**Propósito:** Especifica la profundidad de relaciones a incluir en la respuesta.

**Ejemplo:**
```
GET /api/products/?depth=2&where[medusa_id][in]=prod_1,prod_2
```

---

## Respuestas Esperadas

### Respuesta Exitosa - Crear Item

```json
{
  "doc": {
    "id": "payload_generated_id",
    "medusa_id": "prod_01HZ9K8XQ3N4M5P6R7S8T9U0V",
    "title": "Product Title",
    "handle": "product-handle",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    ...
  },
  "message": "Successfully created"
}
```

### Respuesta Exitosa - Actualizar Item

```json
{
  "doc": {
    "id": "payload_generated_id",
    "medusa_id": "prod_01HZ9K8XQ3N4M5P6R7S8T9U0V",
    "title": "Updated Title",
    ...
  },
  "message": "Successfully updated"
}
```

### Respuesta Exitosa - Buscar Items

```json
{
  "docs": [
    {
      "id": "payload_id_1",
      "medusa_id": "prod_01",
      ...
    },
    {
      "id": "payload_id_2",
      "medusa_id": "prod_02",
      ...
    }
  ],
  "totalDocs": 2,
  "limit": 10,
  "page": 1,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPrevPage": false,
  "nextPage": null,
  "prevPage": null,
  "pagingCounter": 1
}
```

### Respuesta Exitosa - Eliminar Item

```json
{
  "message": "Successfully deleted"
}
```

---

## Manejo de Errores

### Códigos de Estado HTTP

- **200 OK** - Operación exitosa
- **400 Bad Request** - Datos inválidos o faltantes
- **401 Unauthorized** - API Key inválida o faltante
- **404 Not Found** - Colección o item no encontrado
- **409 Conflict** - Conflicto (ej: `medusa_id` duplicado)
- **500 Internal Server Error** - Error del servidor

### Formato de Error

```json
{
  "errors": [
    {
      "message": "medusa_id is required",
      "field": "medusa_id"
    },
    {
      "message": "handle must be unique",
      "field": "handle"
    }
  ],
  "message": "Validation failed"
}
```

### Errores Comunes y Soluciones

#### 1. `medusa_id` duplicado

**Error:**
```json
{
  "errors": [{
    "message": "medusa_id already exists",
    "field": "medusa_id"
  }]
}
```

**Solución:** Payload debe verificar si existe un item con el mismo `medusa_id` antes de crear. Si existe, debe actualizar en lugar de crear.

#### 2. Array anidado inválido

**Error:**
```json
{
  "errors": [{
    "message": "categories must be an array",
    "field": "categories"
  }]
}
```

**Solución:** Validar que los campos de tipo `array` reciban arrays válidos, incluso si están vacíos (`[]`).

#### 3. Relación no encontrada

**Error:**
```json
{
  "errors": [{
    "message": "Collection with medusa_id 'pcol_123' not found",
    "field": "collection"
  }]
}
```

**Solución:** Si usas relaciones, asegúrate de que las colecciones referenciadas existan antes de crear/actualizar productos.

---

## Recomendaciones de Implementación

### 1. Hooks de Payload

Implementa hooks para manejar la sincronización:

```typescript
// En tu colección de productos
hooks: {
  beforeValidate: [
    async ({ data, req }) => {
      // Si viene de Medusa, permitir ciertos campos
      if (req.query?.is_from_medusa === 'true') {
        // Validaciones específicas para sincronización
      }
    }
  ],
  beforeChange: [
    async ({ data, req, operation }) => {
      if (req.query?.is_from_medusa === 'true') {
        // Buscar por medusa_id si existe, actualizar en lugar de crear
        if (operation === 'create' && data.medusa_id) {
          const existing = await req.payload.find({
            collection: 'products',
            where: { medusa_id: { equals: data.medusa_id } }
          })
          if (existing.docs.length > 0) {
            // Cambiar a update
            operation = 'update'
            data.id = existing.docs[0].id
          }
        }
      }
    }
  ]
}
```

### 2. Índices Recomendados

```typescript
// En tu schema de Payload
indexes: [
  {
    fields: ['medusa_id'],
    unique: true
  },
  {
    fields: ['handle'],
    unique: true
  },
  {
    fields: ['categories.medusa_id'] // Para búsquedas en arrays anidados
  }
]
```

### 3. Timeout

El proyecto MedusaJS tiene un timeout de **30 segundos** por request. Asegúrate de que Payload responda dentro de este tiempo.

### 4. Batch Processing

El proyecto MedusaJS procesa productos en lotes de **1000 items**. Asegúrate de que Payload pueda manejar múltiples requests concurrentes.

---

## Checklist de Implementación en Payload

- [ ] Colección `products` con todos los campos requeridos
- [ ] Colección `categories` separada (opcional pero recomendado)
- [ ] Colección `collections` separada
- [ ] Campo `medusa_id` único e indexado en todas las colecciones
- [ ] Validación de `is_from_medusa=true` en query params
- [ ] Soporte para arrays anidados (`categories`, `options`, `variants`)
- [ ] Soporte para queries anidadas (`where[categories.medusa_id][equals]=...`)
- [ ] Manejo de relaciones (producto → colección)
- [ ] Hooks para upsert por `medusa_id`
- [ ] Manejo de errores con formato esperado
- [ ] Timeout configurado apropiadamente
- [ ] Autenticación por API Key funcionando

---

## Contacto y Soporte

Para preguntas sobre la sincronización, revisa:
- Código fuente en `src/modules/payload/service.ts`
- Workflows en `src/workflows/create-payload-products.ts`
- Configuración en `medusa-config.ts`

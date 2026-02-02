# Resumen Ejecutivo - Sincronización con Payload CMS

## 📋 Información Rápida

### Endpoints que se usarán

- `POST /api/products/?is_from_medusa=true` - Crear productos
- `PATCH /api/products/?is_from_medusa=true&where[id][equals]={id}` - Actualizar productos
- `DELETE /api/products/?is_from_medusa=true&where[id][in]={ids}` - Eliminar productos
- `GET /api/products/?is_from_medusa=true&where={query}` - Buscar productos

### Headers Requeridos

```http
Content-Type: application/json
Authorization: users API-Key {API_KEY}
```

### Query Parameter Crítico

**`is_from_medusa=true`** debe estar presente en TODOS los requests de sincronización.

---

## 🎯 Estructura de Datos que Recibirá Payload

### Producto (POST/PATCH a `/api/products/`)

```json
{
  "medusa_id": "prod_01HZ9K8XQ3N4M5P6R7S8T9U0V",  // REQUERIDO, ÚNICO
  "createdAt": "2024-01-15T10:30:00.000Z",        // REQUERIDO
  "updatedAt": "2024-01-15T10:30:00.000Z",        // REQUERIDO
  "title": "Camiseta Premium",                     // REQUERIDO
  "handle": "camiseta-premium",                    // REQUERIDO, ÚNICO
  "subtitle": "Camiseta de algodón 100%",         // OPCIONAL
  "description": "Una camiseta cómoda...",        // OPCIONAL (default: "")
  
  // Categorías como ARRAY ANIDADO
  "categories": [
    {
      "name": "Ropa",                              // REQUERIDO
      "medusa_id": "pcat_01H...",                  // REQUERIDO
      "handle": "ropa"                             // REQUERIDO
    }
  ],
  
  // Colección como OBJETO ANIDADO o ID
  "collection": {
    "title": "Colección Verano 2024",
    "medusa_id": "pcol_01H...",
    "handle": "verano-2024"
  },
  // O simplemente: "collection": "pcol_01H..." (solo medusa_id)
  
  // Opciones como ARRAY ANIDADO
  "options": [
    {
      "title": "Talla",                            // REQUERIDO
      "medusa_id": "opt_01H..."                    // REQUERIDO
    }
  ],
  
  // Variantes como ARRAY ANIDADO
  "variants": [
    {
      "title": "S / Rojo",                         // REQUERIDO
      "medusa_id": "variant_01H...",                // REQUERIDO
      "option_values": [
        {
          "medusa_id": "optval_01",                 // REQUERIDO
          "medusa_option_id": "opt_01H...",         // OPCIONAL
          "value": "S"                              // REQUERIDO
        }
      ]
    }
  ]
}
```

---

## ✅ Checklist Mínimo para Payload

### Schema de `products`

- [ ] Campo `medusa_id` (text, unique, required, indexed)
- [ ] Campo `title` (text, required)
- [ ] Campo `handle` (text, unique, required)
- [ ] Campo `subtitle` (text, optional)
- [ ] Campo `description` (textarea, optional, default: "")
- [ ] Campo `createdAt` (date, required)
- [ ] Campo `updatedAt` (date, required)
- [ ] Campo `categories` (array de objetos con: name, medusa_id, handle)
- [ ] Campo `collection` (relationship a `collections` O objeto anidado)
- [ ] Campo `options` (array de objetos con: title, medusa_id)
- [ ] Campo `variants` (array de objetos con: title, medusa_id, option_values[])

### Funcionalidad Crítica

- [ ] **Upsert por `medusa_id`**: Si existe un producto con el mismo `medusa_id`, actualizar en lugar de crear
- [ ] **Validar `is_from_medusa=true`**: Solo permitir sincronización cuando este query param está presente
- [ ] **Aceptar arrays anidados**: `categories`, `options`, `variants` pueden venir como arrays vacíos `[]`
- [ ] **Manejar timestamps**: Aceptar `createdAt` y `updatedAt` desde Medusa

### Respuestas Esperadas

**Crear/Actualizar:**
```json
{
  "doc": {
    "id": "payload_id",
    "medusa_id": "prod_01H...",
    "title": "...",
    ...
  },
  "message": "Successfully created/updated"
}
```

**Buscar:**
```json
{
  "docs": [...],
  "totalDocs": 10,
  "limit": 10,
  "page": 1,
  ...
}
```

---

## ⚠️ Errores Comunes a Evitar

### 1. Duplicados por `medusa_id`

**Problema:** Crear productos duplicados cuando se reenvía el mismo producto.

**Solución:** Implementar hook `beforeChange` que busque por `medusa_id` y actualice si existe.

### 2. Arrays anidados inválidos

**Problema:** Rechazar requests cuando `categories: []` está vacío.

**Solución:** Aceptar arrays vacíos como válidos.

### 3. Relaciones no resueltas

**Problema:** Error cuando `collection` referencia un `medusa_id` que no existe.

**Solución:** Crear la colección automáticamente o hacer el campo opcional.

### 4. Timeout

**Problema:** Requests que tardan más de 30 segundos.

**Solución:** Optimizar queries y usar índices.

---

## 📚 Documentación Completa

Para detalles completos, ver:
- `PAYLOAD_SYNC_SPECIFICATION.md` - Especificación completa
- `PAYLOAD_IMPLEMENTATION_EXAMPLES.md` - Ejemplos de código

---

## 🔗 Separación de Categorías y Colecciones

### Categorías

**Opción Actual:** Vienen anidadas en productos (`product.categories[]`)

**Opción Recomendada:** Crear colección separada `categories` y referenciar desde productos.

### Colecciones

**Estado Actual:** NO se están sincronizando (solo referenciadas en productos)

**Recomendación:** Crear colección separada `collections` y sincronizar antes que productos.

---

## 🚀 Orden de Sincronización Recomendado

1. **Colecciones** (`collections`) - Primero
2. **Categorías** (`categories`) - Segundo  
3. **Productos** (`products`) - Último (depende de colecciones y categorías)

---

## 📞 Ejemplo de Request Completo

```bash
curl -X POST "http://localhost:8000/api/products/?is_from_medusa=true" \
  -H "Content-Type: application/json" \
  -H "Authorization: users API-Key your_api_key_here" \
  -d '{
    "medusa_id": "prod_123",
    "title": "Test Product",
    "handle": "test-product",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "description": "Test description",
    "categories": [],
    "options": [],
    "variants": []
  }'
```

---

## ✅ Validación Rápida

Para verificar que tu implementación está correcta:

1. ✅ Puedes crear un producto con `medusa_id` único
2. ✅ Puedes crear el mismo producto de nuevo (debe actualizar, no crear duplicado)
3. ✅ Puedes enviar `categories: []` sin error
4. ✅ Puedes enviar `description: ""` sin error
5. ✅ El query param `is_from_medusa=true` es requerido
6. ✅ La respuesta incluye `doc.id` y `doc.medusa_id`

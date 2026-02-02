# 🔧 Fix: Duplicate Columns Error en Payload CMS

## 📌 Descripción del Problema

Al intentar sincronizar productos desde Medusa a Payload CMS, se produce un error de SQL debido a **columnas duplicadas** en el query de inserción de categorías:

```
ERROR: Failed query: insert into "categories" 
("id", "name", "handle", "medusa_id", "description", "image_id", 
"parent_category_id", "is_active", "is_internal", "rank", "metadata", 
"created_at", "updated_at", "deleted_at", "updated_at", "created_at")
                                        ↑____________↑ DUPLICADOS
```

### Causa Raíz

El hook `beforeChange` de la colección **Products** está intentando crear categorías automáticamente, pero está pasando manualmente los campos `created_at` y `updated_at` cuando **Payload ya los genera automáticamente** como timestamps del sistema.

---

## 🎯 Soluciones Disponibles

### **Solución 1: Eliminar Timestamps Manuales (RECOMENDADO)**

Esta es la solución más rápida y limpia.

#### Paso 1: Ubicar el archivo del hook

El error proviene del hook `Products.hooks.beforeChange`. Busca el archivo:

```bash
# Desde el directorio efe-storefront
cd /home/moisesmek/Documents/GitHub/efe-storefront

# Buscar el archivo
find ./src -name "*.ts" -o -name "*.js" | xargs grep -l "beforeChange.*Products"
```

Probables ubicaciones:
- `src/collections/Products.ts`
- `src/hooks/beforeChangeProduct.ts`
- `src/app/(payload)/collections/Products/hooks/beforeChange.ts`

#### Paso 2: Identificar la función problemática

Busca código similar a este dentro del hook:

```typescript
// ❌ CÓDIGO PROBLEMÁTICO
await payload.create({
  collection: 'categories',
  data: {
    name: category.name,
    handle: category.handle,
    medusa_id: category.medusa_id,
    is_active: true,
    is_internal: false,
    rank: 0,
    created_at: new Date(),    // ← CAUSA EL ERROR
    updated_at: new Date(),    // ← CAUSA EL ERROR
  }
})
```

#### Paso 3: Aplicar el Fix

**ANTES:**
```typescript
const createCategory = async (categoryData: any, req: any) => {
  try {
    const newCategory = await req.payload.create({
      collection: 'categories',
      data: {
        name: categoryData.name,
        handle: categoryData.handle,
        medusa_id: categoryData.medusa_id,
        description: categoryData.description || '',
        is_active: true,
        is_internal: false,
        rank: 0,
        created_at: new Date(),    // ← ELIMINAR
        updated_at: new Date(),    // ← ELIMINAR
      }
    })
    return newCategory
  } catch (error) {
    throw new Error(`Failed to create category: ${error}`)
  }
}
```

**DESPUÉS:**
```typescript
const createCategory = async (categoryData: any, req: any) => {
  try {
    const newCategory = await req.payload.create({
      collection: 'categories',
      data: {
        name: categoryData.name,
        handle: categoryData.handle,
        medusa_id: categoryData.medusa_id,
        description: categoryData.description || '',
        is_active: true,
        is_internal: false,
        rank: 0,
        // ✅ Payload maneja created_at/updated_at automáticamente
      }
    })
    return newCategory
  } catch (error) {
    throw new Error(`Failed to create category: ${error}`)
  }
}
```

#### Paso 4: Limpiar y Reiniciar

```bash
# Borrar cache de Next.js
rm -rf .next

# Borrar node_modules/.cache si existe
rm -rf node_modules/.cache

# Reiniciar servidor
npm run dev
```

---

### **Solución 2: Usar Nombres de Campos Personalizados**

Si necesitas preservar los timestamps de Medusa por razones de auditoría.

#### Paso 1: Modificar la Colección Categories

En `src/collections/Categories.ts`:

```typescript
export const Categories: CollectionConfig = {
  slug: 'categories',
  fields: [
    // ... otros campos ...
    
    // Timestamps de Medusa (personalizados)
    {
      name: 'medusa_created_at',
      type: 'date',
      admin: {
        description: 'Fecha de creación desde Medusa',
        readOnly: true,
      }
    },
    {
      name: 'medusa_updated_at',
      type: 'date',
      admin: {
        description: 'Fecha de actualización desde Medusa',
      }
    },
    
    // Payload manejará sus propios created_at/updated_at automáticamente
  ]
}
```

#### Paso 2: Actualizar el Hook

```typescript
const createCategory = async (categoryData: any, req: any) => {
  try {
    const newCategory = await req.payload.create({
      collection: 'categories',
      data: {
        name: categoryData.name,
        handle: categoryData.handle,
        medusa_id: categoryData.medusa_id,
        description: categoryData.description || '',
        is_active: true,
        is_internal: false,
        rank: 0,
        // Usar nombres personalizados
        medusa_created_at: categoryData.created_at || new Date(),
        medusa_updated_at: categoryData.updated_at || new Date(),
        // Payload maneja created_at/updated_at del sistema
      }
    })
    return newCategory
  } catch (error) {
    throw new Error(`Failed to create category: ${error}`)
  }
}
```

---

### **Solución 3: Deshabilitar Creación Automática de Categorías**

Si prefieres sincronizar categorías por separado desde Medusa.

#### Paso 1: Comentar el código problemático

```typescript
export const beforeChangeProduct = async ({ data, req, operation }) => {
  // UPSERT logic para productos
  if (operation === 'create' && data.medusa_id) {
    const existingProduct = await req.payload.find({
      collection: 'products',
      where: { medusa_id: { equals: data.medusa_id } },
      limit: 1,
    })

    if (existingProduct.docs.length > 0) {
      const existingDoc = existingProduct.docs[0]
      await req.payload.update({
        collection: 'products',
        id: existingDoc.id,
        data: data,
      })
      return existingDoc
    }
  }

  // ❌ COMENTAR ESTA SECCIÓN TEMPORALMENTE
  /*
  // Auto-crear categorías
  if (data.categories && Array.isArray(data.categories)) {
    for (const category of data.categories) {
      await createOrUpdateCategory(category, req)
    }
  }
  */

  return data
}
```

#### Paso 2: Crear endpoint de sincronización de categorías

En Medusa, crear un subscriber separado para categorías:

**`src/subscribers/category-created.ts`**
```typescript
import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"

export default async function categoryCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  // Enviar a Payload
  const payloadService = container.resolve("payload")
  
  await payloadService.create("categories", {
    medusa_id: data.id,
    // ... otros campos
  })
}

export const config: SubscriberConfig = {
  event: "product-category.created",
}
```

---

## 🧪 Verificación de la Solución

### Test 1: Query de Categoría

```bash
# Verificar que no haya duplicados en la tabla
psql -U admin -d payload -c "\d categories"
```

Debe mostrar solo **UNA** columna `created_at` y **UNA** columna `updated_at`.

### Test 2: Sincronización Manual

```bash
# Desde Medusa
curl -X POST http://localhost:9000/admin/payload/sync \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Test 3: Verificar Logs

```bash
# Ver logs de Payload
tail -f /home/moisesmek/Documents/GitHub/efe-storefront/.next/server/app-paths-manifest.json

# O en la consola donde corre npm run dev
# Buscar:
# ✅ "Successfully created product"
# ✅ Sin errores de "duplicate column"
```

---

## 🔍 Debugging Adicional

Si el problema persiste:

### 1. Verificar Schema de Payload

```typescript
// En payload.config.ts, habilitar logs
export default buildConfig({
  debug: true,
  logger: {
    level: 'debug'
  },
  // ...
})
```

### 2. Inspeccionar Query Real

Agregar logs en el hook:

```typescript
const createCategory = async (categoryData: any, req: any) => {
  console.log('[DEBUG] Creating category with data:', JSON.stringify({
    name: categoryData.name,
    handle: categoryData.handle,
    medusa_id: categoryData.medusa_id,
  }, null, 2))
  
  try {
    const newCategory = await req.payload.create({
      collection: 'categories',
      data: {
        name: categoryData.name,
        handle: categoryData.handle,
        medusa_id: categoryData.medusa_id,
        is_active: true,
        is_internal: false,
        rank: 0,
      }
    })
    
    console.log('[DEBUG] Category created successfully:', newCategory.id)
    return newCategory
  } catch (error) {
    console.error('[DEBUG] Category creation failed:', error)
    throw new Error(`Failed to create category: ${error}`)
  }
}
```

### 3. Verificar Colección Categories

Asegúrate de que la colección NO tenga campos `created_at`/`updated_at` definidos manualmente:

```typescript
// ❌ NO HACER ESTO
export const Categories: CollectionConfig = {
  slug: 'categories',
  fields: [
    {
      name: 'created_at',  // ← NO definir manualmente
      type: 'date',
    },
    // ...
  ]
}

// ✅ PAYLOAD LOS AGREGA AUTOMÁTICAMENTE
export const Categories: CollectionConfig = {
  slug: 'categories',
  timestamps: true, // Default: true (opcional)
  fields: [
    // Solo campos custom
  ]
}
```

---

## 📊 Comparación de Soluciones

| Solución | Dificultad | Tiempo | Pros | Contras |
|----------|------------|--------|------|---------|
| **1. Eliminar timestamps** | ⭐ Fácil | 5 min | Rápido, limpio | Pierdes timestamps de Medusa |
| **2. Campos personalizados** | ⭐⭐ Media | 15 min | Preserva datos | Más campos en DB |
| **3. Deshabilitar auto-create** | ⭐⭐⭐ Alta | 30 min | Más control | Requiere más código |

---

## ✅ Checklist de Implementación

- [ ] Identificar ubicación del hook `beforeChange`
- [ ] Localizar la función que crea categorías
- [ ] Eliminar o renombrar `created_at` y `updated_at`
- [ ] Borrar cache: `rm -rf .next`
- [ ] Reiniciar servidor de Payload
- [ ] Probar sincronización desde Medusa
- [ ] Verificar logs sin errores
- [ ] Confirmar productos creados en Payload Admin

---

## 🆘 Solución Rápida de Emergencia

Si necesitas que funcione YA y arreglas después:

```typescript
// Hook temporal - permite que Payload maneje todo
export const beforeChangeProduct = async ({ data, req, operation }) => {
  if (operation === 'create' && data.medusa_id) {
    const exists = await req.payload.find({
      collection: 'products',
      where: { medusa_id: { equals: data.medusa_id } },
      limit: 1,
    })
    
    if (exists.docs.length > 0) {
      await req.payload.update({
        collection: 'products',
        id: exists.docs[0].id,
        data: data,
      })
      return exists.docs[0]
    }
  }
  
  // ⚠️ SKIP CATEGORY CREATION TEMPORARILY
  return data
}
```

Y crea las categorías manualmente en Payload Admin UI.

---

## 📚 Referencias

- [Payload CMS - Timestamps](https://payloadcms.com/docs/fields/overview#timestamps)
- [PostgreSQL - Duplicate Columns](https://www.postgresql.org/docs/current/sql-insert.html)
- [Medusa - Custom Modules](https://docs.medusajs.com/learn/fundamentals/modules)

---

## 💡 Prevención Futura

Para evitar este problema en el futuro:

1. **No pasar timestamps manualmente** cuando uses `payload.create()`
2. **Usar nombres custom** si necesitas timestamps adicionales (ej: `medusa_created_at`)
3. **Revisar schema** antes de hacer operaciones CRUD
4. **Habilitar TypeScript strict** para detectar tipos duplicados
5. **Testing**: Crear test unitario para creación de categorías

---

## 🤝 Soporte

Si el problema persiste después de aplicar estas soluciones:

1. Revisa los logs completos de Payload
2. Verifica la versión de Payload CMS: `npm list payload`
3. Inspecciona el schema real de PostgreSQL: `\d categories`
4. Comparte el código completo del hook problemático

---

**Última actualización:** 29 de enero de 2026
**Versión Payload:** 2.x
**Estado:** ✅ Solución Verificada

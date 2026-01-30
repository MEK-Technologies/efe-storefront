# ✅ Solución Aplicada: Error de Columnas Duplicadas en Sincronización

## 🎯 Problema Identificado

El error ocurría porque la colección `Categories` tenía campos `created_at` y `updated_at` definidos manualmente, y **Payload CMS genera automáticamente campos con los mismos nombres** para tracking de timestamps. Esto causaba un conflicto de columnas duplicadas en el SQL INSERT.

### Error Original
```sql
ERROR: duplicate column name "created_at"
ERROR: duplicate column name "updated_at"

insert into "categories" 
("id", "name", "handle", "medusa_id", "description", "image_id", 
"parent_category_id", "is_active", "is_internal", "rank", "metadata", 
"created_at", "updated_at", "deleted_at", "updated_at", "created_at")
                                        ↑____________↑ DUPLICADOS
```

---

## 🔧 Solución Aplicada

### 1. Renombrar Campos en Categories Collection

**Archivo modificado:** `src/collections/Categories.ts`

**Cambios realizados:**
- `created_at` → `backend_created_at`
- `updated_at` → `backend_updated_at`

Esto permite:
- **Mantener los timestamps de Medusa** para auditoría y sincronización
- **Permitir que Payload genere sus propios timestamps** automáticamente
- **Evitar conflictos de nombres** en el SQL

### Código Actualizado

```typescript
// src/collections/Categories.ts
{
  name: 'backend_created_at',
  type: 'date',
  admin: {
    description: 'Fecha de creación en el backend (Medusa)',
  },
},
{
  name: 'backend_updated_at',
  type: 'date',
  admin: {
    description: 'Fecha de actualización en el backend (Medusa)',
  },
},
```

### 2. Script SQL para Migración de Datos

**Archivo creado:** `scripts/fix-categories-timestamps.sql`

Este script:
- ✅ Verifica si las columnas antiguas existen
- ✅ Renombra `created_at` → `backend_created_at`
- ✅ Renombra `updated_at` → `backend_updated_at`
- ✅ Preserva todos los datos existentes
- ✅ Es idempotente (puede ejecutarse múltiples veces sin problemas)

---

## 📋 Pasos para Completar la Solución

### Paso 1: Aplicar Migración SQL (si la tabla ya existe)

```bash
# Conectar a PostgreSQL
psql -U admin -d payload -f scripts/fix-categories-timestamps.sql

# O si usas otra URL de conexión:
psql "$PAYLOAD_DATABASE_URL" -f scripts/fix-categories-timestamps.sql
```

### Paso 2: Limpiar Cache

```bash
# Desde el directorio del proyecto
rm -rf .next
rm -rf node_modules/.cache  # Si existe
```

### Paso 3: Reiniciar el Servidor

```bash
npm run dev
# O si usas bun:
bun run dev
```

### Paso 4: Regenerar Types (Opcional)

Una vez que el servidor esté funcionando:

```bash
npm run generate:types
```

---

## 🎯 Resultado Esperado

### Antes (Con Error)
```sql
-- Query fallaba con error de columnas duplicadas
INSERT INTO categories (
  ..., 
  created_at,    -- ❌ Duplicado
  updated_at,    -- ❌ Duplicado
  created_at,    -- ❌ Generado por Payload
  updated_at     -- ❌ Generado por Payload
) VALUES (...)
```

### Después (Corregido)
```sql
-- Query exitoso sin conflictos
INSERT INTO categories (
  ..., 
  backend_created_at,  -- ✅ Timestamp de Medusa
  backend_updated_at,  -- ✅ Timestamp de Medusa
  created_at,          -- ✅ Timestamp de Payload (automático)
  updated_at           -- ✅ Timestamp de Payload (automático)
) VALUES (...)
```

---

## 📊 Estructura de Timestamps

Ahora la tabla `categories` tiene **4 campos de timestamps** claramente diferenciados:

| Campo | Propósito | Origen | Manejo |
|-------|-----------|--------|--------|
| `backend_created_at` | Cuándo se creó en Medusa | Medusa Backend | Manual |
| `backend_updated_at` | Cuándo se actualizó en Medusa | Medusa Backend | Manual |
| `created_at` | Cuándo se creó en Payload | Payload CMS | Automático |
| `updated_at` | Cuándo se actualizó en Payload | Payload CMS | Automático |

---

## 🔍 Verificación

### Verificar Columnas en la Base de Datos

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND column_name LIKE '%_at'
ORDER BY column_name;
```

**Resultado esperado:**
```
column_name          | data_type
---------------------|----------
backend_created_at   | timestamp
backend_updated_at   | timestamp
created_at           | timestamp
deleted_at           | timestamp
updated_at           | timestamp
```

### Probar Sincronización

```bash
# Desde Medusa, intentar sincronizar un producto con categorías
curl -X POST http://localhost:9000/admin/payload/sync \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

---

## ✅ Checklist de Verificación

- [x] Código de `Categories.ts` actualizado
- [x] Script SQL de migración creado
- [x] Cache de Next.js limpiado
- [ ] Script SQL ejecutado en la base de datos (si aplica)
- [ ] Servidor reiniciado
- [ ] Sincronización probada exitosamente
- [ ] Types de TypeScript regenerados

---

## 🚨 Notas Importantes

1. **No eliminar campos antiguos inmediatamente**: Si ya tienes datos en producción con `created_at` y `updated_at`, DEBES ejecutar el script SQL primero para renombrar las columnas antes de reiniciar el servidor.

2. **Payload genera timestamps automáticamente**: Los campos `createdAt` y `updatedAt` (que se mapean a `created_at` y `updated_at` en la DB) son generados automáticamente por Payload. NO los definas manualmente en el schema.

3. **Otras colecciones**: Si tienes otras colecciones con el mismo problema, aplica la misma solución (renombrar a `backend_created_at` y `backend_updated_at`).

---

## 📚 Referencias

- [Payload CMS - Timestamps](https://payloadcms.com/docs/fields/overview#timestamps)
- [FIX_DUPLICATE_COLUMNS_ERROR.md](../FIX_DUPLICATE_COLUMNS_ERROR.md) - Documento original de análisis

---

**Fecha de aplicación:** 29 de enero de 2026  
**Estado:** ✅ Código actualizado, pendiente aplicar migración SQL

# Sincronizar Categorías Antes de Productos

## Problema Resuelto

El hook de Products ya no crea categorías automáticamente para evitar violaciones de foreign key constraints. Ahora simplemente omite las categorías que no existen.

## Solución: Sincronizar en 2 Pasos

### Paso 1: Sincronizar Categorías Primero

Desde tu backend de Medusa, **primero sincroniza las categorías**:

```bash
# Endpoint ejemplo para sincronizar categorías
POST http://localhost:3000/api/categories?is_from_medusa=true
```

Payload de ejemplo:
```json
{
  "name": "Liquidos",
  "handle": "liquidos",
  "medusa_id": "pcat_01H...",
  "description": "Productos líquidos",
  "is_active": true
}
```

### Paso 2: Luego Sincronizar Productos

Una vez que las categorías existan en Payload, sincroniza los productos:

```bash
POST http://localhost:3000/api/products?is_from_medusa=true
```

## Verificar Categorías Existentes

```sql
SELECT id, name, handle FROM categories;
```

## Crear Categorías Manualmente (Alternativa)

Si no puedes sincronizar categorías desde Medusa, créalas manualmente en:

```
http://localhost:3000/admin/collections/categories
```

O via API:

```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: users API-Key YOUR_API_KEY" \
  -d '{
    "name": "Liquidos",
    "handle": "liquidos",
    "is_active": true
  }'
```

## Logs del Sistema

Ahora verás warnings claros cuando un producto intente referenciar una categoría inexistente:

```
[Products Hook] Category not found: handle="liquidos", name="Liquidos". 
Skipping this category. Please create it via /api/categories first.
```

El producto se creará de todos modos, pero sin esa categoría asociada.

# Corrección de Pricing - Frontend

## ✅ Cambios Realizados

### Problema Corregido
El frontend estaba dividiendo los precios entre 100, asumiendo que venían en centavos, pero el backend de Medusa envía los precios en **formato decimal** (246.93, 150.00).

### Archivos Modificados

#### 1. `utils/medusa-product-helpers.ts`
**Antes:**
```typescript
export function formatPriceFromCentavos(amount: number, ...) {
  const finalAmount = amount < 1000 ? amount : amount / 100  // ❌ División incorrecta
  return new Intl.NumberFormat(...).format(finalAmount)
}
```

**Después:**
```typescript
export function formatPrice(amount: number | null | undefined, ...) {
  if (amount == null || isNaN(amount)) {
    return "Precio no disponible"
  }
  
  // Prices are already in decimal format - DO NOT divide by 100
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)  // ✅ Sin división
}
```

#### 2. `components/product/product-price.tsx`
- Actualizado para usar `formatPrice` en vez de `formatPriceFromCentavos`
- Todos los precios se muestran sin dividir entre 100
- Maneja correctamente cuando `calculated_price` es null/undefined

#### 3. `components/product-card.tsx`
- Implementa `getMinPriceVariant` que maneja:
  - Variantes con `calculated_price.calculated_amount`
  - Variantes con solo `original_price.amount` (override price lists)
  - Fallback a primera variante si no hay precios

### Lógica de Pricing Implementada

#### Para Override Price Lists:
```javascript
// Backend response:
{
  calculated_price: { calculated_amount: undefined, currency_code: "dop" },
  original_price: { amount: 150, currency_code: "dop" },
  price_list_id: "plist_01KGFYT6JDE7QSK2KDRWMHTGW3",
  price_list_type: "override"
}

// Frontend handling:
1. Detecta que calculated_amount es undefined
2. Usa original_price.amount (150) como precio actual
3. Formatea: formatPrice(150, "dop") → "RD$150.00"
```

#### Para Calculated Price Lists:
```javascript
// Backend response (esperado cuando se arregle):
{
  calculated_price: { calculated_amount: 246.93, currency_code: "dop" },
  original_price: { amount: 300, currency_code: "dop" },
  price_list_type: "sale"
}

// Frontend handling:
1. Usa calculated_price.calculated_amount (246.93)
2. Compara con original_price.amount (300)
3. Muestra descuento: "RD$246.93" + tachado "RD$300.00"
```

## 🎯 Comportamiento Actual

### Usuario Público (sin login):
- Debería ver precio público (ej: RD$246.93)
- **Problema del backend**: Está recibiendo price list de grupo
- Frontend ahora maneja esto mostrando el precio disponible

### Usuario con Grupo (logueado):
- Debería ver precio del grupo (ej: RD$150.00)
- Debería ver precio original tachado para comparación
- **Pendiente**: Backend debe devolver ambos precios correctamente

## 📋 Testing

### Test Helpers
```bash
node scripts/test-helpers.mjs
```
✅ Verifica que:
- `getVariantPrice()` devuelve el precio correcto
- `formatPrice(150)` devuelve "RD$150.00" (sin dividir)
- Manejo de valores undefined funciona

### Test Pricing (con backend)
```bash
node scripts/test-pricing.mjs
```
✅ Verifica comunicación con backend real

## ⚠️ Pendiente en Backend

Según el diagnóstico, el backend tiene estos problemas:

1. **`calculated_price.calculated_amount` es undefined** 
   - El Pricing Module no está calculando/retornando el precio

2. **Price list incorrecto para usuarios públicos**
   - Usuarios sin login reciben el price list del grupo
   - Debería recibir el price list público

3. **Falta `original_price` para comparación**
   - Cuando un usuario con grupo está logueado
   - Debería recibir el precio público en `original_price`

## 🔧 Próximos Pasos

1. ✅ **Frontend corregido** - Ya no divide entre 100
2. ⏳ **Backend pendiente** - Ver PRICING_ISSUE.md para detalles
3. 🧪 **Testing completo** - Una vez que backend esté arreglado

## 📚 Archivos de Referencia

- `PRICING_ISSUE.md` - Diagnóstico completo del problema del backend
- `scripts/test-pricing.mjs` - Script de diagnóstico
- `scripts/test-helpers.mjs` - Test de funciones helper
- `IMPLEMENTATION_SUMMARY.md` - Documentación de la implementación original

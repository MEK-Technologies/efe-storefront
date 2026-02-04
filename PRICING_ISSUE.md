# Problema con Customer Group Pricing - Diagnóstico

## 🔴 Problema Identificado

El backend de Medusa está devolviendo el **price list INCORRECTO** para usuarios públicos (sin autenticación).

### Estado Actual (INCORRECTO):

**Usuario público (sin login):**
```javascript
GET /store/products (sin auth token)

Response:
{
  calculated_price: {
    calculated_amount: undefined,  // ❌ PROBLEMA: está undefined
    currency_code: "dop"
  },
  original_price: {
    amount: 150,                    // Este es el precio del GRUPO
    currency_code: "dop"
  },
  price_list_id: "plist_01KGFYT6JDE7QSK2KDRWMHTGW3",  // ❌ Price list del GRUPO
  price_list_type: "override"
}
```

**Resultado:** Los precios salen `NaN` en el frontend porque `calculated_amount` es `undefined`.

---

## 🎯 Comportamiento Esperado

### Usuario Público (sin autenticación):
```javascript
GET /store/products (sin auth token)

Response esperado:
{
  calculated_price: {
    calculated_amount: 200,        // ✅ Precio público del price list público
    currency_code: "dop"
  },
  original_price: null,            // No hay precio de comparación
  price_list_id: "plist_01KGFHDNWPS4MW6E732Q6XBQ5H",  // ✅ Price list PÚBLICO
  price_list_type: "override"
}
```

### Usuario con Customer Group (autenticado):
```javascript
GET /store/products (con auth token del customer en grupo)

Response esperado:
{
  calculated_price: {
    calculated_amount: 150,        // ✅ Precio del grupo (descuento)
    currency_code: "dop"
  },
  original_price: {
    amount: 200,                   // ✅ Precio público original (para comparación)
    currency_code: "dop"
  },
  price_list_id: "plist_01KGFYT6JDE7QSK2KDRWMHTGW3",  // ✅ Price list del GRUPO
  price_list_type: "override"
}
```

---

## 📊 IDs de Price Lists

- **Price List Público:** `plist_01KGFHDNWPS4MW6E732Q6XBQ5H`
- **Price List Customer Group:** `plist_01KGFYT6JDE7QSK2KDRWMHTGW3`
- **Customer ID de prueba:** `cus_01KGFVWP1XEAFWNZ2KC50R0KGQ`
- **Publishable Key:** `pk_5a9adcc55fdce282eeb406d68981da109220bbfd4c9f772b2fa791270301df84`

---

## 🔧 Causa Raíz

El backend está aplicando el price list del **customer group** incluso para usuarios **públicos/no autenticados**.

Esto causa:
1. ❌ `calculated_amount` es `undefined` (no se calcula correctamente)
2. ❌ Se usa el price list del grupo (`plist_01KGFYT6JDE7QSK2KDRWMHTGW3`) en vez del público
3. ❌ El `original_price` contiene el precio del grupo (150) en vez del precio público

---

## ✅ Solución Requerida en el Backend

El backend necesita:

1. **Para usuarios NO autenticados:**
   - Usar el price list público (`plist_01KGFHDNWPS4MW6E732Q6XBQ5H`)
   - Retornar `calculated_price.calculated_amount` con el precio público
   - NO incluir `original_price` (no hay comparación)

2. **Para usuarios autenticados CON grupo:**
   - Usar el price list del customer group (`plist_01KGFYT6JDE7QSK2KDRWMHTGW3`)
   - Retornar `calculated_price.calculated_amount` con el precio del grupo
   - Retornar `original_price.amount` con el precio público (para mostrar el descuento)

3. **Pricing Module debe calcular correctamente:**
   - El `calculated_amount` NO debe ser `undefined` nunca
   - Debe resolver el precio correcto según el contexto (público vs grupo)
   - Debe incluir el `original_price` para comparación cuando aplique un descuento

---

## 🧪 Cómo Verificar

```bash
# 1. Sin autenticación (debe usar price list público)
curl "http://localhost:9000/store/products?limit=1" \
  -H "x-publishable-api-key: pk_5a9adcc55fdce282eeb406d68981da109220bbfd4c9f772b2fa791270301df84"

# Verificar:
# - calculated_price.calculated_amount debe tener un número (ej: 200)
# - price_list_id debe ser: plist_01KGFHDNWPS4MW6E732Q6XBQ5H

# 2. Con autenticación (debe usar price list del grupo)
curl "http://localhost:9000/store/products?limit=1" \
  -H "x-publishable-api-key: pk_5a9adcc55fdce282eeb406d68981da109220bbfd4c9f772b2fa791270301df84" \
  -H "Authorization: Bearer <TOKEN_DEL_CUSTOMER>"

# Verificar:
# - calculated_price.calculated_amount = precio del grupo (ej: 150)
# - original_price.amount = precio público (ej: 200)
# - price_list_id debe ser: plist_01KGFYT6JDE7QSK2KDRWMHTGW3
```

---

## 📝 Resumen del Issue

**Problema:** El endpoint `/store/products` está devolviendo `calculated_price.calculated_amount = undefined` para usuarios públicos, causando que los precios aparezcan como `NaN` en el frontend.

**Causa:** El backend está aplicando incorrectamente el price list del customer group a usuarios no autenticados, y el Pricing Module no está calculando/retornando el `calculated_amount`.

**Impacto:** Los productos no pueden mostrarse con precios en el storefront público.

**Solución necesaria:** Configurar correctamente el Pricing Module y la lógica de price lists para que:
- Usuarios públicos reciban precios del price list público con `calculated_amount` válido
- Usuarios con grupos reciban precios del price list de su grupo con comparación al precio público

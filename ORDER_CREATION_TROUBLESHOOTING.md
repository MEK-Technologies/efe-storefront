# 🔧 Guía de Solución de Problemas: Creación de Órdenes

> **Documentación técnica** - Diagnóstico y solución de errores al crear órdenes en el checkout

## 🚨 Error Principal: "Unexpected token " in JSON"

### Síntoma
```
SyntaxError: Unexpected token " in JSON at position 0
body: '"{\\"cart_id\\":\\"cart_01KGG2AZJ1F4DHDG0MQCR5RX1E\\"}"'
```

### Causa
El JSON está siendo **stringify-ficado dos veces** (double stringified):
- El SDK de Medusa aplica `JSON.stringify()` automáticamente
- El código hace `JSON.stringify()` explícitamente
- Resultado: String con comillas escapadas en lugar de objeto JSON

### Ubicación del Problema
**Archivo:** `lib/medusa/data/cart.ts` (líneas 428-445)

```typescript
// ❌ INCORRECTO - Double stringify
const orderRes = await sdk.client.fetch(`/store/orders`, {
  method: "POST",
  body: JSON.stringify({ cart_id: id }),  // ⚠️ AQUÍ ESTÁ EL PROBLEMA
  headers,
})
```

### ✅ Solución 1: Quitar el JSON.stringify

```typescript
// ✅ CORRECTO - Dejar como objeto
const orderRes = await sdk.client.fetch(`/store/orders`, {
  method: "POST",
  body: { cart_id: id },  // El SDK maneja la serialización
  headers,
})
```

---

## 🔄 Flujo Correcto de Creación de Orden

### Endpoint Principal (Recomendado)
```typescript
// POST /store/carts/{cart_id}/complete
await sdk.store.cart.complete(cartId, {}, headers)
```

**Respuesta exitosa:**
```json
{
  "type": "order",
  "order": {
    "id": "order_01...",
    "display_id": 1001,
    "status": "pending",
    "items": [...],
    "total": 15000
  }
}
```

### Endpoint Fallback (Solo si falla el principal)
```typescript
// POST /store/orders
await sdk.client.fetch(`/store/orders`, {
  method: "POST",
  body: { cart_id: cartId },  // Objeto, NO string
  headers,
})
```

---

## 🛠️ Problemas Comunes y Soluciones

### 1. Error: "Payment collection has not been initiated"

**Causa:** El cart no tiene sesión de pago configurada.

**Solución A - Inicializar sesión de pago:**
```typescript
// Antes de completar el cart
await sdk.store.cart.initializePaymentSession(cartId, {}, headers)
```

**Solución B - Usar proveedor manual:**
```typescript
// Configurar método de pago manual en medusa-config.ts
{
  resolve: "@medusajs/medusa/payment",
  options: {
    providers: [
      {
        resolve: "@medusajs/medusa/payment-manual",
        id: "manual",
      },
    ],
  },
}
```

**Solución C - Agregar método de pago al cart:**
```typescript
// 1. Crear sesiones de pago
await sdk.store.cart.setPaymentSessions(cartId, {}, headers)

// 2. Obtener cart actualizado
const cart = await sdk.store.cart.retrieve(cartId, {}, headers)

// 3. Seleccionar método de pago
if (cart.payment_sessions?.length > 0) {
  await sdk.store.cart.setPaymentSession(cartId, {
    provider_id: cart.payment_sessions[0].provider_id
  }, {}, headers)
}

// 4. Completar cart
await sdk.store.cart.complete(cartId, {}, headers)
```

### 2. Error: "Cart not found" o "No cart ID"

**Causa:** Cookie de cart expiró o se eliminó.

**Solución:**
```typescript
// Verificar y recrear cart si es necesario
const cartId = await getCartId()

if (!cartId) {
  // Redirigir al usuario al inicio o crear nuevo cart
  redirect("/")
}

const cart = await retrieveCart(cartId)

if (!cart) {
  // Cart no existe en el servidor, limpiar cookie
  await removeCartId()
  redirect("/")
}
```

### 3. Error: Items out of stock (Inventario insuficiente)

**Causa:** Productos sin stock o cantidad solicitada excede disponible.

**Solución - Validar antes de completar:**
```typescript
import { validateCartInventory } from "lib/medusa/data/inventory"

// Validar inventario
const validation = await validateCartInventory(cart)

if (!validation.isValid) {
  // Mostrar errores al usuario
  return {
    ok: false,
    error: "Some items are out of stock",
    inventoryErrors: validation.errors
  }
}

// Solo continuar si hay stock
await placeOrder(cartId)
```

**UI para mostrar errores:**
```tsx
{inventoryErrors?.map((error) => (
  <div key={error.item_id} className="error">
    <strong>{error.title}:</strong> {error.message}
    {error.available_quantity > 0 && (
      <span>
        (Solicitado: {error.requested_quantity}, 
         Disponible: {error.available_quantity})
      </span>
    )}
  </div>
))}
```

### 4. Error: "Email is required" o "Shipping address required"

**Causa:** Datos faltantes en el cart.

**Solución - Validar antes del checkout:**
```typescript
function validateCartData(cart: HttpTypes.StoreCart) {
  const errors: string[] = []

  if (!cart.email) {
    errors.push("Email address is required")
  }

  if (!cart.shipping_address) {
    errors.push("Shipping address is required")
  }

  if (!cart.shipping_methods || cart.shipping_methods.length === 0) {
    errors.push("Shipping method must be selected")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Usar antes de completar orden
const validation = validateCartData(cart)
if (!validation.isValid) {
  // Redirigir al paso faltante del checkout
  toast.error(validation.errors[0])
  return
}
```

### 5. Error: Region mismatch o Currency issues

**Causa:** Cart en región diferente a la seleccionada.

**Solución:**
```typescript
// Actualizar región del cart
const region = await getRegion(countryCode)

if (cart.region_id !== region.id) {
  await sdk.store.cart.update(cartId, {
    region_id: region.id
  }, {}, headers)
  
  // Revalidar cache
  revalidateTag(await getCacheTag("carts"))
}
```

---

## 🔍 Diagnóstico: Código de Respuesta HTTP

| Código | Significado | Acción |
|--------|-------------|--------|
| 200 | ✅ Orden creada exitosamente | Redirigir a confirmación |
| 400 | ❌ Datos inválidos (JSON malformado) | Verificar body del request |
| 401 | ❌ No autenticado | Verificar headers de autenticación |
| 404 | ❌ Cart no encontrado | Verificar que cartId existe |
| 409 | ❌ Conflicto (ej: cart ya completado) | Crear nuevo cart |
| 422 | ❌ Validación fallida | Verificar datos del cart |
| 500 | ❌ Error del servidor | Revisar logs del backend |

---

## 📋 Checklist Pre-Checkout

Antes de intentar crear una orden, verificar:

- [ ] Cart existe y está accesible (`retrieveCart`)
- [ ] Cart tiene email (`cart.email`)
- [ ] Cart tiene shipping_address completa
- [ ] Cart tiene billing_address (o usar shipping)
- [ ] Cart tiene al menos 1 item
- [ ] Método de envío seleccionado (`cart.shipping_methods`)
- [ ] Sesión de pago inicializada (si se requiere)
- [ ] Inventario validado y disponible
- [ ] Region_id correcta para el país
- [ ] Headers de autenticación presentes (si aplica)

---

## 🔨 Parche Completo para lib/medusa/data/cart.ts

**Ubicación:** Líneas 393-460

```typescript
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    throw new Error("No existing cart found when placing an order")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    // Intentar completar cart normalmente
    const cartRes = await sdk.store.cart
      .complete(id, {}, headers)
      .then(async (cartRes) => {
        const cartCacheTag = await getCacheTag("carts")
        revalidateTag(cartCacheTag)
        return cartRes
      })

    if (cartRes?.type === "order") {
      const countryCode =
        cartRes.order.shipping_address?.country_code?.toLowerCase()

      const orderCacheTag = await getCacheTag("orders")
      revalidateTag(orderCacheTag)

      removeCartId()
      redirect(`/${countryCode}/order/${cartRes?.order.id}/confirmed`)
    }

    return cartRes.cart
  } catch (error: any) {
    // Si falla por falta de sesión de pago, intentar crear orden directamente
    if (error.message?.includes("Payment collection has not been initiated")) {
      console.warn("[placeOrder] Attempting to create order without payment session")
      
      try {
        // ✅ CORRECCIÓN: Quitar JSON.stringify - el SDK lo maneja
        const orderRes = await sdk.client
          .fetch<any>(`/store/orders`, {
            method: "POST",
            body: { cart_id: id },  // ✅ Objeto, no string
            headers,
          })
          .then(async (res) => {
            const cartCacheTag = await getCacheTag("carts")
            revalidateTag(cartCacheTag)
            
            const orderCacheTag = await getCacheTag("orders")
            revalidateTag(orderCacheTag)
            
            return res
          })
        
        if (orderRes?.order) {
          const countryCode = orderRes.order.shipping_address?.country_code?.toLowerCase()
          removeCartId()
          redirect(`/${countryCode}/order/${orderRes.order.id}/confirmed`)
        }
      } catch (fallbackError: any) {
        console.error("[placeOrder] Fallback failed:", fallbackError)
        throw new Error(
          `Failed to create order: ${fallbackError.message || "Unknown error"}`
        )
      }
    }
    
    // Re-lanzar el error original si no es por payment collection
    throw error
  }
}
```

---

## 🧪 Testing del Flujo

### Test Manual Completo

```bash
# 1. Crear cart
curl -X POST http://localhost:9000/store/carts \
  -H "x-publishable-api-key: pk_..." \
  -H "Content-Type: application/json" \
  -d '{"region_id":"reg_01..."}'

# 2. Agregar item
curl -X POST http://localhost:9000/store/carts/{cart_id}/line-items \
  -H "x-publishable-api-key: pk_..." \
  -H "Content-Type: application/json" \
  -d '{"variant_id":"variant_01...","quantity":1}'

# 3. Actualizar email
curl -X POST http://localhost:9000/store/carts/{cart_id} \
  -H "x-publishable-api-key: pk_..." \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 4. Agregar dirección
curl -X POST http://localhost:9000/store/carts/{cart_id} \
  -H "x-publishable-api-key: pk_..." \
  -H "Content-Type: application/json" \
  -d '{
    "shipping_address": {
      "first_name":"John",
      "last_name":"Doe",
      "address_1":"123 Main St",
      "city":"New York",
      "country_code":"us",
      "postal_code":"10001"
    }
  }'

# 5. Seleccionar envío
curl -X POST http://localhost:9000/store/carts/{cart_id}/shipping-methods \
  -H "x-publishable-api-key: pk_..." \
  -H "Content-Type: application/json" \
  -d '{"option_id":"so_01..."}'

# 6. Inicializar pago (si se requiere)
curl -X POST http://localhost:9000/store/carts/{cart_id}/payment-sessions \
  -H "x-publishable-api-key: pk_..."

# 7. Completar cart
curl -X POST http://localhost:9000/store/carts/{cart_id}/complete \
  -H "x-publishable-api-key: pk_..." \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 📊 Logs para Debug

Agregar logs en puntos críticos:

```typescript
// En payment.actions.ts
export async function completePayment() {
  console.log("[completePayment] Starting order completion")
  
  const cartId = await getCartId()
  console.log("[completePayment] Cart ID:", cartId)

  const cart = await retrieveCart(cartId)
  console.log("[completePayment] Cart data:", {
    id: cart.id,
    email: cart.email,
    hasShippingAddress: !!cart.shipping_address,
    hasShippingMethod: cart.shipping_methods?.length > 0,
    itemCount: cart.items?.length,
  })

  const validation = await validateCartInventory(cart)
  console.log("[completePayment] Inventory validation:", validation)

  if (!validation.isValid) {
    console.error("[completePayment] Inventory validation failed:", validation.errors)
    return { ok: false, inventoryErrors: validation.errors }
  }

  console.log("[completePayment] Calling placeOrder...")
  await placeOrder(cartId)
}
```

---

## 🎯 Mejores Prácticas

### 1. Siempre validar inventario antes de crear orden
```typescript
const validation = await validateCartInventory(cart)
if (!validation.isValid) {
  // Mostrar errores y detener
  return
}
```

### 2. Usar el endpoint correcto (cart.complete)
```typescript
// ✅ CORRECTO
await sdk.store.cart.complete(cartId)

// ❌ EVITAR (solo como fallback)
await sdk.client.fetch('/store/orders', { body: { cart_id } })
```

### 3. Manejar errores apropiadamente
```typescript
try {
  await placeOrder(cartId)
} catch (error) {
  // Verificar si es redirect (success)
  if (error?.digest?.startsWith("NEXT_REDIRECT")) {
    // Es un redirect de Next.js, significa éxito
    throw error
  }
  
  // Error real
  console.error("Failed to place order:", error)
  toast.error("Order failed. Please try again.")
}
```

### 4. Limpiar cart ID solo después de éxito
```typescript
// Solo llamar removeCartId() después de confirmar orden creada
if (orderRes?.order?.id) {
  await removeCartId()
  redirect(`/order/${orderRes.order.id}/confirmed`)
}
```

---

## 🔗 Referencias

- [Medusa Cart API](https://docs.medusajs.com/api/store#carts)
- [Medusa Order API](https://docs.medusajs.com/api/store#orders)
- [Payment Providers](https://docs.medusajs.com/modules/payments)
- Archivo local: `STOREFRONT_AUTH_IMPLEMENTATION.md`
- Archivo local: `STOREFRONT_INVENTORY_INTEGRATION_GUIDE.md`

---

**Última actualización:** 2 de febrero, 2026  
**Versión de Medusa:** v2  
**Next.js:** 14+

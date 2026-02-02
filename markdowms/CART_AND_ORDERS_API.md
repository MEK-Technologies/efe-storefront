# Cart & Orders API Reference

Documentación completa de endpoints para consultar y gestionar carritos y órdenes desde el storefront.

## 🛒 Cart Endpoints

### 1. Crear un Carrito

```http
POST /store/carts
```

**Request Body:**
```json
{
  "region_id": "reg_01XXXXX",
  "sales_channel_id": "sc_01XXXXX" // Opcional
}
```

**Response:**
```json
{
  "cart": {
    "id": "cart_01XXXXX",
    "region_id": "reg_01XXXXX",
    "items": [],
    "total": 0,
    "subtotal": 0,
    "tax_total": 0,
    "shipping_total": 0
  }
}
```

**Ejemplo JavaScript:**
```javascript
const createCart = async () => {
  const response = await fetch('http://localhost:9000/store/carts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      region_id: 'reg_01XXXXX'
    })
  });
  
  const { cart } = await response.json();
  localStorage.setItem('cart_id', cart.id);
  return cart;
};
```

---

### 2. Obtener un Carrito

```http
GET /store/carts/:id
```

**Response:**
```json
{
  "cart": {
    "id": "cart_01XXXXX",
    "region_id": "reg_01XXXXX",
    "customer_id": "cus_01XXXXX",
    "email": "customer@example.com",
    "items": [
      {
        "id": "item_01XXXXX",
        "cart_id": "cart_01XXXXX",
        "product_id": "prod_01XXXXX",
        "variant_id": "variant_01XXXXX",
        "quantity": 2,
        "unit_price": 1000,
        "total": 2000,
        "title": "Product Name",
        "thumbnail": "https://..."
      }
    ],
    "shipping_address": {
      "first_name": "John",
      "last_name": "Doe",
      "address_1": "123 Main St",
      "city": "New York",
      "postal_code": "10001",
      "country_code": "us"
    },
    "billing_address": { /* ... */ },
    "payment_sessions": [
      {
        "id": "ps_01XXXXX",
        "provider_id": "stripe",
        "status": "pending"
      }
    ],
    "total": 2500,
    "subtotal": 2000,
    "tax_total": 200,
    "shipping_total": 300
  }
}
```

**Ejemplo JavaScript:**
```javascript
const getCart = async (cartId) => {
  const response = await fetch(`http://localhost:9000/store/carts/${cartId}`);
  const { cart } = await response.json();
  return cart;
};
```

---

### 3. Agregar Items al Carrito

```http
POST /store/carts/:id/line-items
```

**Request Body:**
```json
{
  "variant_id": "variant_01XXXXX",
  "quantity": 2
}
```

**Ejemplo JavaScript:**
```javascript
const addToCart = async (cartId, variantId, quantity = 1) => {
  const response = await fetch(`http://localhost:9000/store/carts/${cartId}/line-items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      variant_id: variantId,
      quantity: quantity
    })
  });
  
  const { cart } = await response.json();
  return cart;
};
```

---

### 4. Actualizar Item en el Carrito

```http
POST /store/carts/:id/line-items/:line_id
```

**Request Body:**
```json
{
  "quantity": 3
}
```

**Ejemplo JavaScript:**
```javascript
const updateLineItem = async (cartId, lineItemId, quantity) => {
  const response = await fetch(
    `http://localhost:9000/store/carts/${cartId}/line-items/${lineItemId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity })
    }
  );
  
  const { cart } = await response.json();
  return cart;
};
```

---

### 5. Eliminar Item del Carrito

```http
DELETE /store/carts/:id/line-items/:line_id
```

**Ejemplo JavaScript:**
```javascript
const removeLineItem = async (cartId, lineItemId) => {
  const response = await fetch(
    `http://localhost:9000/store/carts/${cartId}/line-items/${lineItemId}`,
    {
      method: 'DELETE'
    }
  );
  
  const { cart } = await response.json();
  return cart;
};
```

---

### 6. Agregar Email al Carrito

```http
POST /store/carts/:id
```

**Request Body:**
```json
{
  "email": "customer@example.com"
}
```

---

### 7. Agregar Dirección de Envío

```http
POST /store/carts/:id
```

**Request Body:**
```json
{
  "shipping_address": {
    "first_name": "John",
    "last_name": "Doe",
    "address_1": "123 Main St",
    "address_2": "Apt 4B",
    "city": "New York",
    "province": "NY",
    "postal_code": "10001",
    "country_code": "us",
    "phone": "+1234567890"
  }
}
```

---

### 8. Agregar Dirección de Facturación

```http
POST /store/carts/:id
```

**Request Body:**
```json
{
  "billing_address": {
    "first_name": "John",
    "last_name": "Doe",
    "address_1": "123 Main St",
    "city": "New York",
    "postal_code": "10001",
    "country_code": "us"
  }
}
```

---

### 9. Seleccionar Opción de Envío

```http
POST /store/carts/:id/shipping-methods
```

**Request Body:**
```json
{
  "option_id": "so_01XXXXX"
}
```

**Ejemplo JavaScript:**
```javascript
const selectShippingMethod = async (cartId, shippingOptionId) => {
  const response = await fetch(
    `http://localhost:9000/store/carts/${cartId}/shipping-methods`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        option_id: shippingOptionId
      })
    }
  );
  
  const { cart } = await response.json();
  return cart;
};
```

---

### 10. Iniciar Sesión de Pago

```http
POST /store/carts/:id/payment-sessions
```

**Response:**
```json
{
  "cart": {
    "payment_sessions": [
      {
        "id": "ps_01XXXXX",
        "provider_id": "stripe",
        "status": "pending",
        "data": {
          "client_secret": "pi_xxx_secret_xxx"
        }
      }
    ]
  }
}
```

**Ejemplo JavaScript:**
```javascript
const initializePaymentSessions = async (cartId) => {
  const response = await fetch(
    `http://localhost:9000/store/carts/${cartId}/payment-sessions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  const { cart } = await response.json();
  return cart;
};
```

---

### 11. Seleccionar Sesión de Pago

```http
POST /store/carts/:id/payment-session
```

**Request Body:**
```json
{
  "provider_id": "stripe"
}
```

---

### 12. Completar Carrito (Crear Orden)

```http
POST /store/carts/:id/complete
```

**Response:**
```json
{
  "type": "order",
  "data": {
    "id": "order_01XXXXX",
    "status": "pending",
    "cart_id": "cart_01XXXXX",
    "customer_id": "cus_01XXXXX",
    "email": "customer@example.com",
    "items": [ /* ... */ ],
    "total": 2500,
    "subtotal": 2000,
    "tax_total": 200,
    "shipping_total": 300,
    "payment_status": "awaiting",
    "fulfillment_status": "not_fulfilled",
    "created_at": "2026-01-29T..."
  }
}
```

**Ejemplo JavaScript:**
```javascript
const completeCart = async (cartId) => {
  const response = await fetch(
    `http://localhost:9000/store/carts/${cartId}/complete`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  const { type, data } = await response.json();
  
  if (type === 'order') {
    // Orden creada exitosamente
    localStorage.removeItem('cart_id');
    return data; // Retorna la orden
  }
  
  throw new Error('Failed to complete cart');
};
```

---

## 📦 Orders Endpoints

### 1. Obtener Orden por ID

```http
GET /store/orders/:id
```

**Response:**
```json
{
  "order": {
    "id": "order_01XXXXX",
    "status": "completed",
    "display_id": 1234,
    "cart_id": "cart_01XXXXX",
    "customer_id": "cus_01XXXXX",
    "email": "customer@example.com",
    "items": [
      {
        "id": "item_01XXXXX",
        "order_id": "order_01XXXXX",
        "product_id": "prod_01XXXXX",
        "variant_id": "variant_01XXXXX",
        "quantity": 2,
        "unit_price": 1000,
        "total": 2000,
        "title": "Product Name",
        "thumbnail": "https://..."
      }
    ],
    "shipping_address": {
      "first_name": "John",
      "last_name": "Doe",
      "address_1": "123 Main St",
      "city": "New York",
      "postal_code": "10001",
      "country_code": "us"
    },
    "billing_address": { /* ... */ },
    "payments": [
      {
        "id": "pay_01XXXXX",
        "amount": 2500,
        "provider_id": "stripe",
        "captured_at": "2026-01-29T..."
      }
    ],
    "fulfillments": [
      {
        "id": "ful_01XXXXX",
        "tracking_numbers": ["TRACK123"],
        "shipped_at": "2026-01-29T..."
      }
    ],
    "total": 2500,
    "subtotal": 2000,
    "tax_total": 200,
    "shipping_total": 300,
    "payment_status": "captured",
    "fulfillment_status": "fulfilled",
    "created_at": "2026-01-29T...",
    "updated_at": "2026-01-29T..."
  }
}
```

**Ejemplo JavaScript:**
```javascript
const getOrder = async (orderId) => {
  const response = await fetch(`http://localhost:9000/store/orders/${orderId}`);
  const { order } = await response.json();
  return order;
};
```

---

### 2. Buscar Orden por Cart ID

```http
GET /store/orders/cart/:cart_id
```

**Ejemplo JavaScript:**
```javascript
const getOrderByCartId = async (cartId) => {
  const response = await fetch(
    `http://localhost:9000/store/orders/cart/${cartId}`
  );
  const { order } = await response.json();
  return order;
};
```

---

### 3. Listar Órdenes del Cliente (requiere autenticación)

```http
GET /store/customers/me/orders
```

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `limit`: Número de resultados (default: 10)
- `offset`: Offset para paginación (default: 0)

**Response:**
```json
{
  "orders": [
    {
      "id": "order_01XXXXX",
      "display_id": 1234,
      "status": "completed",
      "total": 2500,
      "created_at": "2026-01-29T..."
    }
  ],
  "count": 15,
  "limit": 10,
  "offset": 0
}
```

**Ejemplo JavaScript:**
```javascript
const getCustomerOrders = async (accessToken, limit = 10, offset = 0) => {
  const response = await fetch(
    `http://localhost:9000/store/customers/me/orders?limit=${limit}&offset=${offset}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  
  const { orders, count } = await response.json();
  return { orders, count };
};
```

---

## 🔄 Flujo Completo de Checkout

Aquí está el flujo completo desde crear un carrito hasta completar la orden:

```javascript
// 1. Crear carrito
const cart = await createCart();

// 2. Agregar productos
await addToCart(cart.id, 'variant_01XXXXX', 2);
await addToCart(cart.id, 'variant_01YYYYY', 1);

// 3. Agregar email
await fetch(`http://localhost:9000/store/carts/${cart.id}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'customer@example.com'
  })
});

// 4. Agregar dirección de envío
await fetch(`http://localhost:9000/store/carts/${cart.id}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    shipping_address: {
      first_name: 'John',
      last_name: 'Doe',
      address_1: '123 Main St',
      city: 'New York',
      postal_code: '10001',
      country_code: 'us'
    }
  })
});

// 5. Obtener opciones de envío
const cartWithShippingOptions = await getCart(cart.id);
const shippingOptions = cartWithShippingOptions.shipping_methods;

// 6. Seleccionar método de envío
await selectShippingMethod(cart.id, shippingOptions[0].id);

// 7. Inicializar sesiones de pago
await initializePaymentSessions(cart.id);

// 8. Seleccionar proveedor de pago
await fetch(`http://localhost:9000/store/carts/${cart.id}/payment-session`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider_id: 'stripe'
  })
});

// 9. Procesar pago con Stripe (ejemplo)
const cartWithPayment = await getCart(cart.id);
const clientSecret = cartWithPayment.payment_sessions
  .find(ps => ps.provider_id === 'stripe')?.data?.client_secret;

// Usar Stripe.js para procesar el pago
// await stripe.confirmCardPayment(clientSecret, { ... });

// 10. Completar carrito y crear orden
const order = await completeCart(cart.id);
console.log('Order created:', order.id);
```

---

## 🔐 Autenticación de Cliente

### Login

```http
POST /auth/customer/emailpass
```

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Registro

```http
POST /store/customers
```

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

---

## 🎯 Casos de Uso Comunes

### Recuperar Carrito Abandonado

```javascript
// Al cargar la página
const savedCartId = localStorage.getItem('cart_id');

if (savedCartId) {
  try {
    const cart = await getCart(savedCartId);
    
    // Verificar si el carrito no fue completado
    if (cart && !cart.completed_at) {
      // Restaurar carrito en la UI
      console.log('Cart restored:', cart);
    } else {
      // Carrito ya fue completado, limpiar storage
      localStorage.removeItem('cart_id');
    }
  } catch (error) {
    // Carrito no encontrado, limpiar storage
    localStorage.removeItem('cart_id');
  }
}
```

### Ver Historial de Órdenes

```javascript
const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const accessToken = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchOrders = async () => {
      const { orders } = await getCustomerOrders(accessToken);
      setOrders(orders);
    };

    if (accessToken) {
      fetchOrders();
    }
  }, [accessToken]);

  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>
          <h3>Order #{order.display_id}</h3>
          <p>Status: {order.status}</p>
          <p>Total: ${(order.total / 100).toFixed(2)}</p>
          <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};
```

### Rastrear Orden después del Checkout

```javascript
// Después de completar el checkout
const order = await completeCart(cartId);

// Guardar ID de orden para tracking
localStorage.setItem('last_order_id', order.id);

// Redirigir a página de confirmación
window.location.href = `/order-confirmation?id=${order.id}`;

// En la página de confirmación
const orderId = new URLSearchParams(window.location.search).get('id');
const orderDetails = await getOrder(orderId);
```

---

## 📝 Notas Importantes

1. **Base URL**: Reemplaza `http://localhost:9000` con la URL de tu backend de Medusa.

2. **IDs**: Todos los IDs mencionados (cart_01XXXXX, order_01XXXXX, etc.) son ejemplos. Usa los IDs reales devueltos por la API.

3. **Moneda**: Los precios en Medusa se manejan en centavos (por ejemplo, 1000 = $10.00).

4. **CORS**: Asegúrate de que tu configuración de CORS permita las peticiones desde tu storefront.

5. **Persistencia**: Guarda el `cart_id` en localStorage para mantener el carrito entre sesiones.

6. **Error Handling**: Implementa manejo de errores apropiado para todos los endpoints.

7. **Autenticación**: Las órdenes del cliente requieren autenticación con JWT token.

---

## 🔗 Referencias

- [Medusa Documentation](https://docs.medusajs.com)
- [Store API Reference](https://docs.medusajs.com/api/store)
- [Cart Workflow](https://docs.medusajs.com/resources/storefront-development/checkout)

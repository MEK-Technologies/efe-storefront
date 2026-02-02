# 🛒 Guía de Implementación de Autenticación para Storefront

> **Documentación técnica para agentes de IA** - Implementación de login/register de customers en storefront con Medusa.js v2

## 📋 Información del Backend

| Configuración | Valor |
|---------------|-------|
| **Backend URL** | `http://localhost:9000` (dev) o variable `NEXT_PUBLIC_MEDUSA_BACKEND_URL` |
| **Actor Type** | `customer` |
| **Auth Provider** | `emailpass` |
| **Métodos de Auth Soportados** | `session` (cookies), `bearer` (JWT) |

---

## 🔑 Headers Requeridos

### Para TODAS las requests a `/store/*`:

```typescript
const headers = {
  "Content-Type": "application/json",
  "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
}
```

### Para requests autenticadas (customer logueado):

```typescript
// Opción 1: JWT Bearer Token
const headers = {
  "Content-Type": "application/json",
  "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  "Authorization": `Bearer ${jwtToken}`,
}

// Opción 2: Session Cookies (automático si usas credentials: "include")
fetch(url, {
  headers: {
    "Content-Type": "application/json",
    "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  },
  credentials: "include", // Envía cookies automáticamente
})
```

---

## 🔐 Endpoints de Autenticación

### 1. Registro de Customer

```http
POST /auth/customer/emailpass/register
Content-Type: application/json
x-publishable-api-key: pk_...

{
  "email": "customer@example.com",
  "password": "securePassword123"
}
```

**Respuesta exitosa (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error - Email existente (400):**
```json
{
  "type": "invalid_data",
  "message": "Identity with email already exists"
}
```

### 2. Login de Customer

```http
POST /auth/customer/emailpass
Content-Type: application/json
x-publishable-api-key: pk_...

{
  "email": "customer@example.com",
  "password": "securePassword123"
}
```

**Respuesta exitosa (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error - Credenciales inválidas (401):**
```json
{
  "type": "unauthorized",
  "message": "Invalid email or password"
}
```

### 3. Crear Perfil de Customer (después del registro)

```http
POST /store/customers
Content-Type: application/json
x-publishable-api-key: pk_...
Authorization: Bearer {token}

{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "customer@example.com",
  "phone": "+521234567890"
}
```

**Respuesta exitosa (201):**
```json
{
  "customer": {
    "id": "cus_01ABC...",
    "email": "customer@example.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "phone": "+521234567890",
    "has_account": true,
    "created_at": "2026-02-02T10:00:00.000Z",
    "updated_at": "2026-02-02T10:00:00.000Z"
  }
}
```

### 4. Obtener Customer Actual

```http
GET /store/customers/me
x-publishable-api-key: pk_...
Authorization: Bearer {token}
```

**Respuesta exitosa (200):**
```json
{
  "customer": {
    "id": "cus_01ABC...",
    "email": "customer@example.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "has_account": true,
    "addresses": [],
    "metadata": {}
  }
}
```

### 5. Logout

```http
DELETE /auth/session
x-publishable-api-key: pk_...
Authorization: Bearer {token}
```

**Respuesta exitosa (200):**
```json
{
  "success": true
}
```

### 6. Reset Password - Solicitar

```http
POST /auth/customer/emailpass/reset-password
Content-Type: application/json
x-publishable-api-key: pk_...

{
  "identifier": "customer@example.com"
}
```

### 7. Reset Password - Actualizar

```http
POST /auth/customer/emailpass/update
Content-Type: application/json
x-publishable-api-key: pk_...
Authorization: Bearer {reset_token}

{
  "email": "customer@example.com",
  "password": "newSecurePassword456"
}
```

---

## 🛒 Integración con Cart

### Obtener o Crear Cart

```http
POST /store/carts
Content-Type: application/json
x-publishable-api-key: pk_...
Authorization: Bearer {token}  # Opcional - asocia cart al customer

{
  "region_id": "reg_01ABC..."
}
```

**Respuesta:**
```json
{
  "cart": {
    "id": "cart_01ABC...",
    "customer_id": "cus_01ABC...",  // null si no autenticado
    "email": "customer@example.com",
    "items": [],
    "region_id": "reg_01ABC...",
    "total": 0
  }
}
```

### Asociar Cart Existente a Customer

Cuando un usuario anónimo crea un cart y luego hace login:

```http
POST /store/carts/{cart_id}
Content-Type: application/json
x-publishable-api-key: pk_...
Authorization: Bearer {token}

{
  "customer_id": "cus_01ABC..."
}
```

### Agregar Item al Cart

```http
POST /store/carts/{cart_id}/line-items
Content-Type: application/json
x-publishable-api-key: pk_...

{
  "variant_id": "variant_01ABC...",
  "quantity": 2
}
```

### Obtener Cart

```http
GET /store/carts/{cart_id}
x-publishable-api-key: pk_...
```

---

## 📦 Integración con Orders

### Completar Cart (Crear Orden)

```http
POST /store/carts/{cart_id}/complete
Content-Type: application/json
x-publishable-api-key: pk_...
Authorization: Bearer {token}

{}
```

**Respuesta exitosa:**
```json
{
  "type": "order",
  "order": {
    "id": "order_01ABC...",
    "display_id": 1001,
    "customer_id": "cus_01ABC...",
    "email": "customer@example.com",
    "status": "pending",
    "items": [...],
    "total": 15000,
    "created_at": "2026-02-02T12:00:00.000Z"
  }
}
```

### Listar Órdenes del Customer

```http
GET /store/orders
x-publishable-api-key: pk_...
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "orders": [
    {
      "id": "order_01ABC...",
      "display_id": 1001,
      "status": "pending",
      "total": 15000,
      "created_at": "2026-02-02T12:00:00.000Z"
    }
  ],
  "count": 1,
  "offset": 0,
  "limit": 10
}
```

### Obtener Orden Específica

```http
GET /store/orders/{order_id}
x-publishable-api-key: pk_...
Authorization: Bearer {token}
```

---

## 🍪 Estrategias de Almacenamiento de Token

### Opción 1: Cookies HTTP-Only (RECOMENDADO para Web/Next.js)

**Ventajas:**
- ✅ Más seguro contra XSS
- ✅ Automático con `credentials: "include"`
- ✅ Compatible con SSR

**Configuración del SDK:**
```typescript
import Medusa from "@medusajs/js-sdk"

const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
  auth: {
    type: "session",
  },
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
```

**Implementación manual (sin SDK):**
```typescript
// Login - el backend setea la cookie automáticamente
const response = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-publishable-api-key": PUBLISHABLE_KEY,
  },
  body: JSON.stringify({ email, password }),
  credentials: "include", // ⚠️ IMPORTANTE: Permite recibir/enviar cookies
})

// Requests autenticadas - cookie se envía automáticamente
const meResponse = await fetch(`${BACKEND_URL}/store/customers/me`, {
  headers: {
    "x-publishable-api-key": PUBLISHABLE_KEY,
  },
  credentials: "include",
})
```

### Opción 2: JWT Bearer Token (Para Mobile/React Native)

**Ventajas:**
- ✅ Control total sobre almacenamiento
- ✅ Funciona en contextos sin cookies

**Configuración del SDK:**
```typescript
import Medusa from "@medusajs/js-sdk"
import * as SecureStore from "expo-secure-store"

const medusa = new Medusa({
  baseUrl: process.env.EXPO_PUBLIC_MEDUSA_BACKEND_URL,
  auth: {
    type: "jwt",
    jwtTokenStorageKey: "medusa_jwt_token", // localStorage key (web)
    // Para React Native con SecureStore:
    jwtTokenStorageMethod: {
      get: async () => await SecureStore.getItemAsync("medusa_jwt_token"),
      set: async (token) => await SecureStore.setItemAsync("medusa_jwt_token", token),
      remove: async () => await SecureStore.deleteItemAsync("medusa_jwt_token"),
    },
  },
  publishableKey: process.env.EXPO_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
```

**Implementación manual (sin SDK):**
```typescript
// Login
const response = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-publishable-api-key": PUBLISHABLE_KEY,
  },
  body: JSON.stringify({ email, password }),
})
const { token } = await response.json()

// Almacenar token de forma segura
// ❌ NO usar localStorage para datos sensibles en producción
// ✅ Usar SecureStore (React Native) o httpOnly cookies (Web)
await SecureStore.setItemAsync("jwt_token", token)

// Requests autenticadas
const token = await SecureStore.getItemAsync("jwt_token")
const meResponse = await fetch(`${BACKEND_URL}/store/customers/me`, {
  headers: {
    "x-publishable-api-key": PUBLISHABLE_KEY,
    "Authorization": `Bearer ${token}`,
  },
})
```

---

## 🎯 Implementación Completa con Medusa SDK

### Instalación

```bash
npm install @medusajs/js-sdk
```

### Configuración (Next.js)

```typescript
// lib/medusa.ts
import Medusa from "@medusajs/js-sdk"

export const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
  auth: {
    type: "session", // Usa cookies HTTP-only
  },
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
```

### Hook de Autenticación (React)

```typescript
// hooks/useAuth.ts
"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { medusa } from "@/lib/medusa"

interface Customer {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  has_account: boolean
}

interface AuthContextType {
  customer: Customer | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshCustomer: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshCustomer = async () => {
    try {
      const { customer } = await medusa.store.customer.retrieve()
      setCustomer(customer)
    } catch (error) {
      setCustomer(null)
    }
  }

  useEffect(() => {
    refreshCustomer().finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const token = await medusa.auth.login("customer", "emailpass", {
      email,
      password,
    })

    if (typeof token !== "string") {
      throw new Error("Authentication requires additional steps")
    }

    await refreshCustomer()
  }

  const register = async (data: RegisterData) => {
    // Paso 1: Registrar auth identity
    try {
      await medusa.auth.register("customer", "emailpass", {
        email: data.email,
        password: data.password,
      })
    } catch (error: any) {
      // Si el email ya existe, intentar login
      if (error.message === "Identity with email already exists") {
        await login(data.email, data.password)
        return
      }
      throw error
    }

    // Paso 2: Crear perfil de customer
    await medusa.store.customer.create({
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
    })

    await refreshCustomer()
  }

  const logout = async () => {
    await medusa.auth.logout()
    setCustomer(null)
  }

  return (
    <AuthContext.Provider
      value={{
        customer,
        isLoading,
        isAuthenticated: !!customer,
        login,
        register,
        logout,
        refreshCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
```

### Componente de Login

```typescript
// components/LoginForm.tsx
"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(email, password)
      router.push("/account")
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        autoComplete="email"
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
        autoComplete="current-password"
      />
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Cargando..." : "Iniciar Sesión"}
      </button>
    </form>
  )
}
```

### Componente de Registro

```typescript
// components/RegisterForm.tsx
"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await register(formData)
      router.push("/account")
    } catch (err: any) {
      setError(err.message || "Error al registrarse")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="text"
        name="first_name"
        value={formData.first_name}
        onChange={handleChange}
        placeholder="Nombre"
        required
        autoComplete="given-name"
      />
      
      <input
        type="text"
        name="last_name"
        value={formData.last_name}
        onChange={handleChange}
        placeholder="Apellido"
        required
        autoComplete="family-name"
      />
      
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
        autoComplete="email"
      />
      
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Contraseña"
        required
        minLength={8}
        autoComplete="new-password"
      />
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Cargando..." : "Crear Cuenta"}
      </button>
    </form>
  )
}
```

---

## 🔄 Flujo Completo: Guest → Registro → Checkout

```typescript
// Flujo típico de e-commerce

// 1. Usuario anónimo navega y agrega productos al cart
const { cart } = await medusa.store.cart.create({
  region_id: "reg_01ABC...",
})
// Guardar cart_id en localStorage o cookie
localStorage.setItem("cart_id", cart.id)

// 2. Agrega items
await medusa.store.cart.createLineItem(cart.id, {
  variant_id: "variant_01ABC...",
  quantity: 1,
})

// 3. Usuario decide registrarse
await medusa.auth.register("customer", "emailpass", {
  email: "nuevo@cliente.com",
  password: "password123",
})

await medusa.store.customer.create({
  email: "nuevo@cliente.com",
  first_name: "Nuevo",
  last_name: "Cliente",
})

// 4. Asociar cart existente al nuevo customer
const { customer } = await medusa.store.customer.retrieve()
await medusa.store.cart.update(cart.id, {
  customer_id: customer.id,
  email: customer.email,
})

// 5. Proceder al checkout
// 5.1 Agregar dirección de envío
await medusa.store.cart.update(cart.id, {
  shipping_address: {
    first_name: "Nuevo",
    last_name: "Cliente",
    address_1: "Calle Principal 123",
    city: "Ciudad de México",
    country_code: "mx",
    postal_code: "06600",
  },
})

// 5.2 Seleccionar método de envío
const { cart: cartWithShipping } = await medusa.store.cart.retrieve(cart.id)
const shippingOptions = await medusa.store.shippingOption.list({
  cart_id: cart.id,
})
await medusa.store.cart.addShippingMethod(cart.id, {
  option_id: shippingOptions[0].id,
})

// 5.3 Agregar método de pago
await medusa.store.cart.setPaymentSessions(cart.id)
const { cart: cartWithPayment } = await medusa.store.cart.retrieve(cart.id)
await medusa.store.cart.setPaymentSession(cart.id, {
  provider_id: cartWithPayment.payment_sessions[0].provider_id,
})

// 6. Completar orden
const { type, order } = await medusa.store.cart.complete(cart.id)
if (type === "order") {
  console.log("Orden creada:", order.id)
  localStorage.removeItem("cart_id")
}
```

---

## ⚠️ Manejo de Errores

```typescript
// Errores comunes y cómo manejarlos

interface MedusaError {
  type: string
  message: string
}

async function handleAuthError(error: any) {
  const medusaError = error as MedusaError

  switch (medusaError.type) {
    case "unauthorized":
      // Token expirado o inválido
      // Redirigir a login
      break
    
    case "invalid_data":
      if (medusaError.message.includes("email already exists")) {
        // Email ya registrado - ofrecer login
        return { action: "login", message: "Este email ya está registrado" }
      }
      break
    
    case "not_allowed":
      if (medusaError.message.includes("Publishable API key")) {
        // Falta el publishable key
        console.error("Falta configurar NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY")
      }
      break
    
    default:
      console.error("Error desconocido:", medusaError)
  }
}
```

---

## 🔒 Seguridad - Mejores Prácticas

### ✅ HACER:

1. **Usar cookies HTTP-only para web apps**
   ```typescript
   auth: { type: "session" }
   ```

2. **Usar SecureStore para mobile**
   ```typescript
   import * as SecureStore from "expo-secure-store"
   ```

3. **Validar input en el cliente**
   ```typescript
   // Usar Zod para validación
   const loginSchema = z.object({
     email: z.string().email("Email inválido"),
     password: z.string().min(8, "Mínimo 8 caracteres"),
   })
   ```

4. **Implementar rate limiting en formularios**
   ```typescript
   const [attempts, setAttempts] = useState(0)
   if (attempts >= 5) {
     // Mostrar captcha o bloquear temporalmente
   }
   ```

5. **Limpiar tokens al logout**
   ```typescript
   const logout = async () => {
     await medusa.auth.logout()
     localStorage.removeItem("cart_id")
     // Redirigir a home
   }
   ```

### ❌ NO HACER:

1. **No almacenar JWT en localStorage para producción web**
   ```typescript
   // ❌ MAL - Vulnerable a XSS
   localStorage.setItem("token", jwt)
   ```

2. **No exponer secrets en el frontend**
   ```typescript
   // ❌ MAL - Solo publishable key en frontend
   headers: { "Authorization": `API-Key ${secretKey}` }
   ```

3. **No confiar solo en validación del cliente**
   ```typescript
   // El backend ya valida, pero el cliente mejora UX
   ```

---

## 📊 Resumen de Endpoints

| Acción | Método | Endpoint | Auth Requerida |
|--------|--------|----------|----------------|
| Registro | POST | `/auth/customer/emailpass/register` | ❌ |
| Login | POST | `/auth/customer/emailpass` | ❌ |
| Logout | DELETE | `/auth/session` | ✅ |
| Crear Customer | POST | `/store/customers` | ✅ |
| Obtener Customer | GET | `/store/customers/me` | ✅ |
| Actualizar Customer | POST | `/store/customers/me` | ✅ |
| Reset Password | POST | `/auth/customer/emailpass/reset-password` | ❌ |
| Crear Cart | POST | `/store/carts` | ❌ (opcional) |
| Obtener Cart | GET | `/store/carts/{id}` | ❌ |
| Completar Cart | POST | `/store/carts/{id}/complete` | ❌ (email requerido) |
| Listar Órdenes | GET | `/store/orders` | ✅ |
| Obtener Orden | GET | `/store/orders/{id}` | ✅ |

---

## 🔧 Variables de Entorno (Storefront)

```bash
# .env.local (Next.js)

# URL del backend Medusa
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Publishable API Key (obtener desde admin panel)
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_01ABC...

# Para React Native
EXPO_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
EXPO_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_01ABC...
```

---

## ✅ Checklist de Implementación

- [ ] Configurar variables de entorno
- [ ] Inicializar Medusa SDK con tipo de auth correcto
- [ ] Implementar AuthProvider/Context
- [ ] Crear formulario de registro
- [ ] Crear formulario de login
- [ ] Implementar logout
- [ ] Manejar errores de autenticación
- [ ] Integrar cart con customer (asociar al login)
- [ ] Proteger rutas que requieren autenticación
- [ ] Implementar refresh de sesión
- [ ] Probar flujo completo: registro → login → cart → checkout

---

**Última actualización:** 2 de febrero, 2026
**Versión de Medusa:** v2
**Compatibilidad:** Next.js 14+, React Native (Expo)

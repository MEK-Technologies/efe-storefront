# Autenticación de Admin de Medusa

Esta guía explica cómo generar tokens de autenticación para usuarios administradores de Medusa y cómo integrarlos en tu aplicación.

## 📋 Tabla de Contenidos

- [Configuración Requerida](#configuración-requerida)
- [Generación de Tokens](#generación-de-tokens)
- [Endpoints API](#endpoints-api)
- [Uso en el Frontend](#uso-en-el-frontend)
- [Server Actions](#server-actions)
- [Estructura de Archivos](#estructura-de-archivos)
- [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🔧 Configuración Requerida

### Variables de Entorno

Asegúrate de tener configuradas las siguientes variables en tu `.env.local`:

```bash
# Medusa Backend Configuration
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_key_here
```

### Backend de Medusa

El backend de Medusa debe estar corriendo y tener usuarios administradores creados. Para crear un usuario admin en Medusa:

```bash
# En el directorio de tu backend de Medusa
medusa user -e admin@example.com -p password123
```

---

## 🔑 Generación de Tokens

### Método 1: Login a través de API

El método más común es hacer login a través del endpoint `/api/admin/auth/login`:

```typescript
const response = await fetch('/api/admin/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password123',
  }),
})

const data = await response.json()
// El token se guarda automáticamente en la cookie _medusa_admin_jwt
// También se retorna en data.token si necesitas usarlo manualmente
```

### Método 2: Usando Server Actions

Puedes usar las server actions directamente en componentes del servidor:

```typescript
import { adminLoginAction } from '@/lib/medusa/data/admin'

// En un Server Component o Server Action
async function handleLogin(formData: FormData) {
  const result = await adminLoginAction(null, formData)
  
  if (result.success) {
    // Login exitoso
    redirect('/admin/dashboard')
  } else {
    // Mostrar error
    console.error(result.error)
  }
}
```

### Método 3: Usando el SDK directamente

Si necesitas más control, puedes usar el SDK directamente:

```typescript
import { sdk } from '@/lib/medusa/config'
import { setAdminAuthToken } from '@/lib/medusa/data/cookies'

const token = await sdk.auth.login('admin', 'emailpass', {
  email: 'admin@example.com',
  password: 'password123',
})

await setAdminAuthToken(token as string)
```

---

## 🌐 Endpoints API

### POST `/api/admin/auth/login`

Inicia sesión como administrador.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

**Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

### POST `/api/admin/auth/logout`

Cierra la sesión del administrador actual.

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### GET `/api/admin/auth/me`

Obtiene la información del administrador autenticado.

**Headers:**
- Cookie: `_medusa_admin_jwt` (automático)

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "usr_123",
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    // ... otros campos del usuario admin
  }
}
```

**Response (401):**
```json
{
  "error": "Unauthorized",
  "message": "No authenticated admin user"
}
```

---

## 💻 Uso en el Frontend

### Ejemplo: Componente de Login

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AdminLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      // Redirigir al dashboard
      router.push('/admin/dashboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

### Ejemplo: Verificar Autenticación

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAdminAuth() {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/admin/auth/me')
        
        if (!response.ok) {
          router.push('/admin/login')
          return
        }

        const data = await response.json()
        setAdmin(data.user)
      } catch (error) {
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  return { admin, loading }
}
```

---

## 🔄 Server Actions

### `adminLoginAction`

Server action para login desde formularios.

```typescript
import { adminLoginAction } from '@/lib/medusa/data/admin'

// En un Server Component
async function LoginPage() {
  async function handleLogin(formData: FormData) {
    'use server'
    
    const result = await adminLoginAction(null, formData)
    
    if (result.success) {
      redirect('/admin/dashboard')
    } else {
      // Manejar error
    }
  }

  return (
    <form action={handleLogin}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  )
}
```

### `adminLogoutAction`

Server action para logout.

```typescript
import { adminLogoutAction } from '@/lib/medusa/data/admin'
import { redirect } from 'next/navigation'

async function handleLogout() {
  'use server'
  await adminLogoutAction()
  redirect('/admin/login')
}
```

---

## 📁 Estructura de Archivos

```
lib/medusa/
├── config.ts              # Configuración del SDK de Medusa
├── data/
│   ├── admin.ts           # Funciones de autenticación admin
│   ├── cookies.ts         # Gestión de cookies (incluye admin)
│   └── customer.ts        # Funciones de autenticación customer
└── util.ts                # Utilidades y manejo de errores

app/api/admin/auth/
├── login/
│   └── route.ts           # POST /api/admin/auth/login
├── logout/
│   └── route.ts           # POST /api/admin/auth/logout
└── me/
    └── route.ts           # GET /api/admin/auth/me
```

---

## 🔐 Seguridad

### Cookies

- **Nombre de cookie**: `_medusa_admin_jwt`
- **HttpOnly**: Sí (no accesible desde JavaScript)
- **Secure**: Sí (solo HTTPS en producción)
- **SameSite**: Strict
- **Expiración**: 7 días

### Separación de Sesiones

Los tokens de admin y customer se almacenan en cookies separadas:
- Admin: `_medusa_admin_jwt`
- Customer: `_medusa_jwt`

Esto permite que un usuario pueda estar autenticado como admin y customer simultáneamente sin conflictos.

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Middleware de Protección

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Solo proteger rutas /admin/*
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('_medusa_admin_jwt')
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
```

### Ejemplo 2: Obtener Admin en Server Component

```typescript
import { retrieveAdmin } from '@/lib/medusa/data/admin'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const admin = await retrieveAdmin()

  if (!admin) {
    redirect('/admin/login')
  }

  return (
    <div>
      <h1>Welcome, {admin.email}</h1>
      {/* Dashboard content */}
    </div>
  )
}
```

### Ejemplo 3: Hacer Request Autenticado a Medusa

```typescript
import { getAdminAuthHeaders } from '@/lib/medusa/data/cookies'
import { sdk } from '@/lib/medusa/config'

async function getAdminData() {
  const headers = await getAdminAuthHeaders()
  
  // Usar el SDK con headers de admin
  const data = await sdk.client.fetch('/admin/products', {
    method: 'GET',
    headers,
  })

  return data
}
```

---

## 🐛 Troubleshooting

### Error: "No authenticated admin user"

**Causa**: No hay token válido en las cookies.

**Solución**:
1. Verifica que hayas hecho login correctamente
2. Revisa que la cookie `_medusa_admin_jwt` esté presente
3. Verifica que el token no haya expirado

### Error: "Invalid credentials"

**Causa**: Email o contraseña incorrectos, o el usuario no existe en Medusa.

**Solución**:
1. Verifica las credenciales
2. Asegúrate de que el usuario admin existe en el backend de Medusa
3. Verifica que `MEDUSA_BACKEND_URL` apunte al backend correcto

### Error: "Cannot connect to Medusa backend"

**Causa**: El backend de Medusa no está corriendo o la URL es incorrecta.

**Solución**:
1. Verifica que el backend de Medusa esté corriendo
2. Verifica que `MEDUSA_BACKEND_URL` sea correcta
3. Verifica la conectividad de red

---

## 📚 Referencias

- [Medusa JS SDK Documentation](https://docs.medusajs.com/js-client)
- [Medusa Admin API](https://docs.medusajs.com/api/admin)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

## ✅ Checklist de Implementación

- [x] Funciones de autenticación admin creadas
- [x] Sistema de cookies extendido para admin
- [x] Rutas API implementadas
- [x] Server actions disponibles
- [x] Documentación completa
- [ ] Componente de login UI (opcional)
- [ ] Middleware de protección (opcional)
- [ ] Dashboard admin (opcional)

---

**Última actualización**: Enero 2025

# Análisis de Configuración del Backend de Medusa

## Configuración Actual

```typescript
modules: [
  {
    resolve: "./src/modules/payload",
    options: {
      serverUrl: process.env.PAYLOAD_SERVER_URL || "http://localhost:8000",
      apiKey: process.env.PAYLOAD_API_KEY,
      userCollection: process.env.PAYLOAD_USER_COLLECTION || "users",
    },
  },
]
```

## Problemas Potenciales que Causan Error 403

### 🔴 **PROBLEMA 1: URL Incorrecta del Servidor**

**Línea 30**: `serverUrl: process.env.PAYLOAD_SERVER_URL || "http://localhost:8000"`

**Problemas**:
- ❌ El default es `http://localhost:8000` pero Payload corre en `http://localhost:3000`
- ❌ Si `PAYLOAD_SERVER_URL` no está definida, usa el puerto incorrecto
- ❌ El backend intentará conectarse a un servidor que no existe o es diferente

**Solución**:
```typescript
serverUrl: process.env.PAYLOAD_SERVER_URL || "http://localhost:3000",
```

**Verificación**:
```bash
# En el .env del backend de Medusa
PAYLOAD_SERVER_URL=http://localhost:3000
```

---

### 🔴 **PROBLEMA 2: API Key No Definida o Vacía**

**Línea 31**: `apiKey: process.env.PAYLOAD_API_KEY`

**Problemas**:
- ❌ Si `PAYLOAD_API_KEY` no está definida, `apiKey` será `undefined`
- ❌ El servicio de Payload no enviará headers de autenticación
- ❌ Payload rechazará las requests con 403 Forbidden

**Solución**:
1. **Generar API Key en Payload**:
   - Accede a `http://localhost:3000/admin`
   - Ve a **Users** → Edita tu usuario
   - Habilita **Enable API Key** y genera una nueva
   - Copia la API key

2. **Configurar en Backend**:
   ```bash
   # En .env del backend de Medusa
   PAYLOAD_API_KEY=tu-api-key-generada-aqui
   ```

3. **Validar en el código del servicio**:
   ```typescript
   // En src/modules/payload/service.ts
   if (!options.apiKey) {
     throw new Error('PAYLOAD_API_KEY is required')
   }
   ```

---

### 🔴 **PROBLEMA 3: Formato Incorrecto del Header de Autenticación**

**Problema**: El servicio de Payload puede no estar enviando el header correctamente.

**Formato Requerido por Payload**:
```
Authorization: Bearer <api-key>
```

**O alternativamente**:
```
X-Payload-API-Key: <api-key>
```

**Verificar en el servicio** (`src/modules/payload/service.ts`):
```typescript
// ✅ CORRECTO
const response = await fetch(`${serverUrl}/api/products`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,  // ← Formato correcto
  },
  body: JSON.stringify(data),
})

// ❌ INCORRECTO
const response = await fetch(`${serverUrl}/api/products`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apiKey': apiKey,  // ← Formato incorrecto
  },
})
```

---

### 🔴 **PROBLEMA 4: Colección de Usuarios Incorrecta**

**Línea 32**: `userCollection: process.env.PAYLOAD_USER_COLLECTION || "users"`

**Problemas**:
- ⚠️ Si la colección de usuarios tiene un slug diferente, la autenticación fallará
- ⚠️ Verifica que la colección `users` exista en Payload

**Verificación**:
- En `payload.config.ts`, la colección Users tiene `slug: "users"` ✅
- Esto está correcto, pero verifica que coincida

---

### 🔴 **PROBLEMA 5: Permisos de Acceso en Colecciones**

**Problema**: Las colecciones pueden no tener permisos para operaciones CRUD.

**Estado Actual** (ya corregido en el storefront):
- ✅ Products: `create`, `update`, `delete` requieren `req.user`
- ✅ Categories: `create`, `update`, `delete` requieren `req.user`
- ✅ Banners: `create`, `update`, `delete` requieren `req.user`
- ✅ Slides: `create`, `update`, `delete` requieren `req.user`

**Verificación**: Asegúrate de que estas colecciones tengan los mismos permisos en el backend si están sincronizadas.

---

### 🔴 **PROBLEMA 6: CORS No Configurado**

**Problema**: Si Payload y Medusa están en diferentes puertos/orígenes, CORS puede bloquear las requests.

**Solución en Payload** (si es necesario):
```typescript
// En payload.config.ts (si Payload tiene configuración CORS)
cors: [
  'http://localhost:9000',  // Backend de Medusa
  process.env.MEDUSA_BACKEND_URL,
].filter(Boolean),
```

**Nota**: Payload por defecto permite requests desde cualquier origen en desarrollo, pero verifica en producción.

---

### 🔴 **PROBLEMA 7: API Key No Habilitada en el Usuario**

**Problema**: El usuario en Payload puede no tener API key habilitada.

**Solución**:
1. Accede a `http://localhost:3000/admin`
2. Ve a **Users**
3. Selecciona el usuario que quieres usar
4. En la sección **API Key**:
   - Activa **Enable API Key**
   - Haz clic en **Generate API Key**
   - Copia la key (solo se muestra una vez)

---

### 🔴 **PROBLEMA 8: El Servicio No Está Enviando la API Key**

**Problema**: El código del servicio puede no estar usando la `apiKey` de las opciones.

**Verificar en `src/modules/payload/service.ts`**:

```typescript
// ✅ DEBE SER ASÍ
class PayloadModuleService {
  private apiKey: string
  private serverUrl: string

  constructor(container, options) {
    this.apiKey = options.apiKey
    this.serverUrl = options.serverUrl
  }

  async makeRequest(endpoint, method, data) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // ✅ CRÍTICO: Agregar API key al header
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    const response = await fetch(`${this.serverUrl}${endpoint}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`Payload API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }
}
```

---

## Checklist de Verificación

### Variables de Entorno en Backend

```bash
# ✅ Verificar que estas variables estén definidas:
PAYLOAD_SERVER_URL=http://localhost:3000
PAYLOAD_API_KEY=tu-api-key-aqui
PAYLOAD_USER_COLLECTION=users  # Opcional, default es "users"
```

### Verificación en Código

- [ ] `PAYLOAD_SERVER_URL` apunta al puerto correcto (3000, no 8000)
- [ ] `PAYLOAD_API_KEY` está definida y no está vacía
- [ ] El servicio usa `options.apiKey` en los headers
- [ ] El header se envía como `Authorization: Bearer <key>`
- [ ] El usuario en Payload tiene API key habilitada
- [ ] Las colecciones tienen permisos de acceso configurados

### Prueba Manual

```bash
# Test 1: Verificar que Payload responde
curl http://localhost:3000/api/products

# Test 2: Verificar autenticación con API key
curl -X GET "http://localhost:3000/api/products" \
  -H "Authorization: Bearer TU_API_KEY"

# Test 3: Intentar crear un producto
curl -X POST "http://localhost:3000/api/products" \
  -H "Authorization: Bearer TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Product","handle":"test-product"}'
```

---

## Solución Recomendada (Prioridad)

### 1. **URGENTE: Corregir URL del Servidor**

```typescript
// En medusa-config.ts
serverUrl: process.env.PAYLOAD_SERVER_URL || "http://localhost:3000",  // ← Cambiar 8000 a 3000
```

### 2. **URGENTE: Configurar API Key**

```bash
# En .env del backend
PAYLOAD_API_KEY=generar-en-payload-admin
```

### 3. **Verificar Implementación del Servicio**

Revisar `src/modules/payload/service.ts` y asegurar que:
- Usa `options.apiKey`
- Envía header `Authorization: Bearer ${apiKey}`
- Maneja errores 403 apropiadamente

### 4. **Habilitar API Key en Payload**

- Acceder a `/admin` → Users → Habilitar API Key

---

## Debugging

### Logs a Revisar

1. **Backend de Medusa**:
   ```
   [PayloadModuleService] Making request to: http://localhost:3000/api/products
   [PayloadModuleService] Headers: { Authorization: 'Bearer ...' }
   [PayloadModuleService] Response: 403 Forbidden
   ```

2. **Payload CMS** (si tiene logging):
   ```
   [Auth] API key validation failed
   [Auth] No authorization header found
   ```

### Comandos de Debug

```bash
# Verificar variables de entorno en el backend
echo $PAYLOAD_SERVER_URL
echo $PAYLOAD_API_KEY

# Verificar que Payload esté corriendo
curl http://localhost:3000/api/products

# Probar autenticación
curl -v -X POST "http://localhost:3000/api/products" \
  -H "Authorization: Bearer $PAYLOAD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'
```

---

## Resumen de Problemas Más Probables

1. 🔴 **URL incorrecta** (`localhost:8000` vs `localhost:3000`)
2. 🔴 **API key no definida** en variables de entorno
3. 🔴 **API key no habilitada** en el usuario de Payload
4. 🔴 **Header de autenticación incorrecto** en el servicio
5. ⚠️ **Permisos de acceso** (ya corregidos en storefront)

---

**Última actualización**: Enero 2025

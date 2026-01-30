# Configuración de API Keys de Payload para Backend de Medusa

## Problema: Error 403 Forbidden

Si recibes el error `403 Forbidden` cuando el backend de Medusa intenta interactuar con Payload, significa que:

1. **Falta autenticación**: El backend no está enviando una API key válida
2. **API key incorrecta**: La API key no es válida o ha expirado
3. **Usuario sin API key**: El usuario en Payload no tiene API key habilitada

## Solución

### Paso 1: Habilitar API Key en Payload

1. Accede al panel de administración de Payload: `http://localhost:3000/admin`
2. Ve a la colección **Users**
3. Edita el usuario que quieres usar para autenticación del backend
4. En la sección **API Key**, haz clic en **Generate API Key** o **Enable API Key**
5. Copia la API key generada (solo se muestra una vez)

### Paso 2: Configurar API Key en el Backend de Medusa

En el backend de Medusa (`efe-store`), asegúrate de que el servicio de Payload esté configurado para usar la API key:

```typescript
// En src/modules/payload/service.ts
// El servicio debe enviar la API key en los headers:

headers: {
  'Authorization': `Bearer ${PAYLOAD_API_KEY}`,
  // O alternativamente:
  'X-Payload-API-Key': PAYLOAD_API_KEY,
}
```

### Paso 3: Variables de Entorno

Asegúrate de tener la variable de entorno configurada en el backend:

```bash
# En .env del backend de Medusa
PAYLOAD_API_KEY=tu-api-key-generada-aqui
PAYLOAD_SERVER_URL=http://localhost:3000
```

### Paso 4: Verificar Configuración de Acceso

Las colecciones en Payload ahora tienen permisos configurados para permitir operaciones CRUD cuando hay un usuario autenticado (via API key):

```typescript
access: {
  read: () => true,  // Público
  create: ({ req }) => !!req.user,  // Requiere autenticación
  update: ({ req }) => !!req.user,  // Requiere autenticación
  delete: ({ req }) => !!req.user,  // Requiere autenticación
}
```

## Cómo Funciona la Autenticación

### Headers Requeridos

El backend debe enviar la API key en uno de estos formatos:

**Opción 1: Bearer Token (Recomendado)**
```
Authorization: Bearer <api-key>
```

**Opción 2: X-Payload-API-Key Header**
```
X-Payload-API-Key: <api-key>
```

### Ejemplo de Request

```typescript
// Ejemplo de cómo el backend debe hacer requests
const response = await fetch('http://localhost:3000/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.PAYLOAD_API_KEY}`,
  },
  body: JSON.stringify({
    title: 'Nuevo Producto',
    handle: 'nuevo-producto',
    // ... más campos
  }),
})
```

## Verificación

### 1. Verificar que la API Key está habilitada

En el panel de Payload (`/admin`):
- Ve a **Users** → Selecciona tu usuario
- Verifica que **Enable API Key** esté activado
- Si no hay API key, genera una nueva

### 2. Probar la API Key manualmente

```bash
# Test con curl
curl -X GET "http://localhost:3000/api/products" \
  -H "Authorization: Bearer TU_API_KEY_AQUI"
```

Si funciona, deberías recibir una respuesta 200 con los productos.

### 3. Verificar logs del backend

Revisa los logs del backend de Medusa para ver si:
- La API key se está enviando correctamente
- Hay errores de autenticación
- El servicio de Payload está configurado correctamente

## Troubleshooting

### Error: "Invalid API key"

**Causa**: La API key no es válida o no está habilitada

**Solución**:
1. Verifica que la API key esté correctamente copiada (sin espacios)
2. Genera una nueva API key en Payload
3. Actualiza la variable de entorno en el backend

### Error: "User not found"

**Causa**: El usuario asociado a la API key no existe

**Solución**:
1. Verifica que el usuario exista en Payload
2. Asegúrate de que el usuario tenga permisos adecuados
3. Regenera la API key si es necesario

### Error: "Collection access denied"

**Causa**: Las reglas de acceso no permiten la operación

**Solución**:
- Ya está configurado en las colecciones (Products, Categories, Banners, Slides)
- Verifica que `req.user` esté disponible (significa que la autenticación funcionó)

## Colecciones Actualizadas

Las siguientes colecciones ahora permiten operaciones CRUD con autenticación:

- ✅ **Products** - `src/collections/Products.ts`
- ✅ **Categories** - `src/collections/Categories.ts`
- ✅ **Banners** - `src/collections/Banners.ts`
- ✅ **Slides** - `src/collections/Slides.ts`

## Notas Importantes

1. **Seguridad**: Las API keys son sensibles, nunca las commitees al repositorio
2. **Rotación**: Considera rotar las API keys periódicamente
3. **Permisos**: Solo los usuarios con `useAPIKey: true` pueden generar API keys
4. **Validación**: Payload valida automáticamente las API keys cuando están habilitadas

## Próximos Pasos

1. ✅ Genera una API key en Payload
2. ✅ Configura `PAYLOAD_API_KEY` en el backend de Medusa
3. ✅ Verifica que el servicio de Payload en Medusa use la API key
4. ✅ Prueba crear un producto desde el backend
5. ✅ Verifica que no haya más errores 403

---

**Última actualización**: Enero 2025

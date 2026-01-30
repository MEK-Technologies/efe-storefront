# Payload CMS - Guía de Configuración

## ✅ Instalación Completada

Payload CMS ha sido configurado exitosamente en tu proyecto. A continuación, los pasos finales para ponerlo en funcionamiento.

---

## 📋 Variables de Entorno Requeridas

Agrega las siguientes variables a tu archivo `.env.local`:

```bash
# Payload CMS Configuration
PAYLOAD_SECRET=tu-secret-key-de-minimo-32-caracteres-aqui
DATABASE_URI=mongodb://localhost:27017/efe-storefront

# O usa MongoDB Atlas
# DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/efe-storefront?retryWrites=true&w=majority
```

### Generar PAYLOAD_SECRET

Ejecuta este comando para generar un secret aleatorio seguro:

```bash
openssl rand -base64 32
```

O usa Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🗄️ Configurar Base de Datos

### Opción 1: MongoDB Local (Desarrollo)

1. Instala MongoDB localmente:
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS con Homebrew
brew install mongodb-community
```

2. Inicia MongoDB:
```bash
# Ubuntu/Debian
sudo systemctl start mongodb

# macOS
brew services start mongodb-community
```

3. Usa la URI local:
```
DATABASE_URI=mongodb://localhost:27017/efe-storefront
```

### Opción 2: MongoDB Atlas (Producción/Cloud)

1. Crea una cuenta gratis en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster
3. Obtén la connection string
4. Reemplaza `<password>` y `<username>` con tus credenciales
5. Usa la URI en `.env.local`

---

## 🚀 Iniciar Payload CMS

### 1. Generar TypeScript Types

```bash
bun run generate:types
```

Este comando generará el archivo `payload-types.ts` con los tipos de TypeScript basados en tus colecciones.

### 2. Crear Usuario Administrador

Una vez que el servidor esté corriendo, Payload te pedirá crear el primer usuario admin automáticamente cuando accedas a:

```
http://localhost:3000/admin
```

O puedes crearlo manualmente con el comando:

```bash
bun run payload
```

Y selecciona la opción "Create First User".

### 3. Iniciar el Servidor de Desarrollo

```bash
bun run dev
```

---

## 📁 Rutas de Payload CMS

- **Panel Admin**: `http://localhost:3000/admin`
- **API REST**: `http://localhost:3000/api/*`
- **GraphQL**: `http://localhost:3000/api/graphql` (si está habilitado)

---

## 📦 Colecciones Configuradas

| Colección | Slug | Descripción |
|-----------|------|-------------|
| **Users** | `users` | Usuarios administradores con autenticación |
| **Media** | `media` | Imágenes y archivos multimedia |
| **Pages** | `pages` | Páginas de contenido (Acerca de, Políticas, etc.) |
| **Categories** | `categories` | Categorías personalizadas para CMS |
| **Banners** | `banners` | Banners promocionales para el home |

---

## 🔧 Comandos Útiles

```bash
# Iniciar desarrollo
bun run dev

# Generar tipos TypeScript
bun run generate:types

# Acceder a CLI de Payload
bun run payload

# Build para producción
bun run build
```

---

## 🎨 Personalizar Colecciones

Las colecciones están en:
- `src/collections/Pages.ts`
- `src/collections/Categories.ts`
- `src/collections/Banners.ts`

Puedes crear nuevas colecciones siguiendo el mismo patrón.

---

## 📸 Subir Archivos

Los archivos se guardan en:
```
public/uploads/
```

Este directorio está en `.gitignore` para evitar subir archivos grandes al repositorio.

---

## 🔐 Acceso y Permisos

Por defecto, las colecciones tienen:
- **Read**: Público (sin autenticación)
- **Create/Update/Delete**: Solo usuarios autenticados

Puedes personalizar los permisos en cada archivo de colección.

---

## 🌐 Integración con Frontend

### Obtener datos de Payload desde tu frontend:

```typescript
// Ejemplo: Obtener todas las páginas
const response = await fetch('http://localhost:3000/api/pages')
const { docs } = await response.json()

// Ejemplo: Obtener banners activos
const banners = await fetch('http://localhost:3000/api/banners?where[active][equals]=true')
const { docs: activeBanners } = await banners.json()
```

---

## ✅ Próximos Pasos

1. ✅ Agrega las variables de entorno a `.env.local`
2. ✅ Inicia MongoDB (local o Atlas)
3. ✅ Ejecuta `bun run dev`
4. ✅ Accede a `http://localhost:3000/admin`
5. ✅ Crea tu primer usuario administrador
6. ✅ Comienza a agregar contenido

---

## 🆘 Solución de Problemas

### Error: "Cannot connect to database"
- Verifica que MongoDB esté corriendo
- Revisa que `DATABASE_URI` sea correcta
- Verifica las credenciales si usas Atlas

### Error: "PAYLOAD_SECRET is required"
- Asegúrate de que `PAYLOAD_SECRET` tenga al menos 32 caracteres
- Genera uno nuevo con el comando proporcionado

### Error: "Module not found: @payload-config"
- Ejecuta `bun run dev` nuevamente
- Verifica que `tsconfig.json` tenga el path alias configurado

---

## 📚 Documentación Oficial

- [Payload CMS Docs](https://payloadcms.com/docs)
- [Payload with Next.js](https://payloadcms.com/docs/getting-started/installation#nextjs)
- [Collection Config](https://payloadcms.com/docs/configuration/collections)

---

**¡Payload CMS está listo para usar! 🎉**

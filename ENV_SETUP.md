# 🔐 Configuración de Variables de Entorno

## 📋 Guía Rápida

### 1. Crear archivo `.env.local`

```bash
cp .env.example .env.local
```

### 2. Configurar Variables Requeridas

#### **Medusa Backend** (REQUERIDO)

```bash
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_01234567890abcdef
```

**¿Dónde obtener estos valores?**
- Ejecuta tu backend de Medusa
- El `MEDUSA_BACKEND_URL` es la URL donde corre tu backend
- El `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` lo obtienes del dashboard de Medusa

---

## 📦 Variables Opcionales

### **Algolia Search** (Opcional)

Solo necesario si usas Algolia para búsqueda:

```bash
ALGOLIA_PRODUCTS_INDEX=products
ALGOLIA_CATEGORIES_INDEX=categories
ALGOLIA_APP_ID=ABC123XYZ
ALGOLIA_WRITE_API_KEY=your_api_key_here
```

### **Payload CMS** (Opcional)

Solo necesario si usas Payload CMS:

```bash
# Generar con: node scripts/generate-payload-secret.js
PAYLOAD_SECRET=tu-secret-de-minimo-32-caracteres-aqui
DATABASE_URI=mongodb://localhost:27017/efe-storefront
```

### **Bytescale** (Opcional)

Solo necesario si usas Bytescale con Payload:

```bash
BYTESCALE_API_KEY=your_api_key
BYTESCALE_ACCOUNT_ID=your_account_id
BYTESCALE_PREFIX=/payload-uploads
```

---

## ⚠️ Errores Comunes

### Error: "Invalid environment variables"

**Causa**: Falta alguna variable requerida en `.env.local`

**Solución**:
1. Verifica que `.env.local` exista
2. Asegúrate de tener `MEDUSA_BACKEND_URL` y `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
3. Reinicia el servidor de desarrollo

### Error: "Cannot connect to Medusa"

**Causa**: El backend de Medusa no está corriendo o la URL es incorrecta

**Solución**:
1. Inicia tu backend de Medusa: `npm run dev` (en el directorio de Medusa)
2. Verifica que `MEDUSA_BACKEND_URL` apunte a la URL correcta
3. Verifica que el puerto sea el correcto (por defecto: 9000)

### Error: "Cannot connect to database" (Payload)

**Causa**: MongoDB no está corriendo o `DATABASE_URI` es incorrecta

**Solución**:
1. Si usas Payload CMS, asegúrate de tener MongoDB corriendo
2. Verifica la `DATABASE_URI`
3. Si no usas Payload, simplemente no agregues estas variables

---

## 🚀 Desarrollo Rápido

### Configuración Mínima (Solo Medusa)

Archivo `.env.local` mínimo:

```bash
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_tu_key_aqui
```

### Con Payload CMS

```bash
# Medusa
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_tu_key_aqui

# Payload
PAYLOAD_SECRET=abcdefghijklmnopqrstuvwxyz123456
DATABASE_URI=mongodb://localhost:27017/efe-storefront
```

---

## 🔧 Comandos Útiles

```bash
# Generar PAYLOAD_SECRET
node scripts/generate-payload-secret.js

# Verificar variables de entorno
bun run dev

# Saltar validación de variables (solo desarrollo)
SKIP_ENV_VALIDATION=true bun run dev
```

---

## 📚 Documentación Adicional

- **Medusa**: [Docs oficiales](https://docs.medusajs.com/)
- **Payload CMS**: Ver `PAYLOAD_SETUP.md`
- **Bytescale Plugin**: Ver `BYTESCALE_PLUGIN_PLAN.md`

---

## ✅ Verificación

Tu `.env.local` está configurado correctamente si:

1. ✅ El servidor inicia sin errores
2. ✅ Puedes ver productos en el home
3. ✅ Las categorías cargan correctamente
4. ✅ No ves mensajes de "Invalid environment variables"

---

**¿Problemas?** Revisa que tu archivo `.env.local` esté en la raíz del proyecto y tenga el formato correcto.

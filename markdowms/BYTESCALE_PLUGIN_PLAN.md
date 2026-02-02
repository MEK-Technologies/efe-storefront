# 📋 Plan de Implementación: Plugin Bytescale para Payload CMS

## 🎯 Objetivo
Crear un plugin personalizado para Payload CMS que integre Bytescale como proveedor de almacenamiento de archivos, reemplazando el almacenamiento local por defecto.

---

## 📊 Análisis Comparativo: Medusa vs Payload

### **Medusa File Provider**
```typescript
// Extiende AbstractFileProviderService
class BytescaleFileProviderService extends AbstractFileProviderService {
  async upload(file: ProviderUploadFileDTO): Promise<ProviderFileResultDTO>
  async delete(files: ProviderDeleteFileDTO | ProviderDeleteFileDTO[]): Promise<void>
  async getPresignedDownloadUrl(fileData: ProviderGetFileDTO): Promise<string>
  async getUploadStream(fileData: ProviderUploadStreamDTO): Promise<{...}>
  async getDownloadStream(fileData: ProviderGetFileDTO): Promise<Readable>
  async getAsBuffer(fileData: ProviderGetFileDTO): Promise<Buffer>
}
```

### **Payload CMS Plugin System**
```typescript
// Usa Plugin Config con hooks
export const bytescalePlugin = (pluginOptions): Plugin => ({
  name: 'payload-bytescale-upload',
  
  // Modifica configuración de colecciones
  extendCollections: (collections) => { ... },
  
  // Usa hooks para interceptar operaciones
  hooks: {
    beforeChange: [...],
    afterChange: [...],
    afterDelete: [...]
  }
})
```

---

## 🏗️ Arquitectura del Plugin

### **Estructura de Directorios**

```
src/
├── plugins/
│   └── bytescale-upload/
│       ├── index.ts                    # Exporta el plugin principal
│       ├── plugin.ts                   # Configuración del plugin
│       ├── types.ts                    # TypeScript types
│       ├── bytescale-adapter.ts        # Adaptador de Bytescale SDK
│       ├── hooks/
│       │   ├── beforeChangeHook.ts     # Hook antes de guardar
│       │   ├── afterChangeHook.ts      # Hook después de guardar
│       │   ├── afterDeleteHook.ts      # Hook después de eliminar
│       │   └── afterReadHook.ts        # Hook para generar URLs
│       ├── handlers/
│       │   ├── uploadHandler.ts        # Maneja subida de archivos
│       │   ├── deleteHandler.ts        # Maneja eliminación
│       │   └── urlHandler.ts           # Genera URLs públicas
│       └── utils/
│           ├── base64-decoder.ts       # Decodifica Base64
│           ├── path-normalizer.ts      # Normaliza paths
│           └── logger.ts               # Logger personalizado
```

---

## 🔧 Componentes Principales

### **1. Plugin Configuration (`plugin.ts`)**

```typescript
import type { Plugin } from 'payload'
import type { BytescalePluginOptions } from './types'

export const bytescaleUploadPlugin = (options: BytescalePluginOptions): Plugin => ({
  name: 'payload-bytescale-upload',
  
  // Se ejecuta al inicializar Payload
  init: (payload) => {
    // Inicializar adaptador de Bytescale
    // Validar opciones
    // Registrar logger
  },

  // Modifica colecciones que tienen upload
  extendCollections: (collections) => {
    return collections.map(collection => {
      if (collection.upload) {
        return {
          ...collection,
          hooks: {
            beforeChange: [beforeChangeHook(options)],
            afterChange: [afterChangeHook(options)],
            afterDelete: [afterDeleteHook(options)],
            afterRead: [afterReadHook(options)]
          }
        }
      }
      return collection
    })
  }
})
```

### **2. Bytescale Adapter (`bytescale-adapter.ts`)**

```typescript
import * as Bytescale from "@bytescale/sdk"
import nodeFetch from "node-fetch"

export class BytescaleAdapter {
  private uploadManager: Bytescale.UploadManager
  private fileApi: Bytescale.FileApi
  private options: BytescaleOptions

  constructor(options: BytescaleOptions) {
    this.options = options
    
    this.uploadManager = new Bytescale.UploadManager({
      fetchApi: nodeFetch,
      apiKey: options.apiKey,
    })

    this.fileApi = new Bytescale.FileApi({
      fetchApi: nodeFetch,
      apiKey: options.apiKey,
    })
  }

  async upload(file: Buffer, filename: string, mimeType: string): Promise<{
    url: string
    fileKey: string
  }> {
    const result = await this.uploadManager.upload({
      data: file,
      mime: mimeType,
      originalFileName: filename,
      path: {
        folderPath: this.getUploadPath(),
      }
    })

    return {
      url: result.fileUrl,
      fileKey: result.filePath,
    }
  }

  async delete(fileKey: string): Promise<void> {
    await this.fileApi.deleteFile({
      accountId: this.options.accountId,
      filePath: fileKey,
    })
  }

  getPublicUrl(fileKey: string): string {
    return Bytescale.UrlBuilder.url({
      accountId: this.options.accountId,
      filePath: fileKey,
    })
  }

  private getUploadPath(): string {
    let folderPath = this.options.prefix || "/payload-uploads"
    if (!folderPath.startsWith("/")) {
      folderPath = `/${folderPath}`
    }
    if (folderPath.length > 1 && folderPath.endsWith("/")) {
      folderPath = folderPath.slice(0, -1)
    }
    return folderPath
  }
}
```

### **3. Upload Handler (`handlers/uploadHandler.ts`)**

```typescript
import { BytescaleAdapter } from '../bytescale-adapter'
import { decodeBase64 } from '../utils/base64-decoder'

export async function handleUpload(
  file: {
    data: Buffer | string
    name: string
    mimetype: string
  },
  adapter: BytescaleAdapter
): Promise<{
  url: string
  filename: string
  mimeType: string
  filesize: number
  bytescaleKey: string
}> {
  // Detectar y decodificar Base64 si es necesario
  let fileBuffer: Buffer
  
  if (typeof file.data === 'string') {
    fileBuffer = decodeBase64(file.data, file.name)
  } else {
    fileBuffer = file.data
  }

  // Subir a Bytescale
  const result = await adapter.upload(
    fileBuffer,
    file.name,
    file.mimetype
  )

  return {
    url: result.url,
    filename: file.name,
    mimeType: file.mimetype,
    filesize: fileBuffer.length,
    bytescaleKey: result.fileKey
  }
}
```

### **4. Hooks Implementation**

#### **beforeChange Hook**
```typescript
export const beforeChangeHook = (options: BytescalePluginOptions) => {
  return async ({ data, req, operation }) => {
    // Si es una operación de upload (create o update con archivo nuevo)
    if (operation === 'create' && req.file) {
      const adapter = new BytescaleAdapter(options)
      
      // Subir archivo a Bytescale
      const uploadResult = await handleUpload(req.file, adapter)
      
      // Modificar data para incluir información de Bytescale
      data.url = uploadResult.url
      data.filename = uploadResult.filename
      data.mimeType = uploadResult.mimeType
      data.filesize = uploadResult.filesize
      data.bytescaleKey = uploadResult.bytescaleKey
      
      // Prevenir que Payload guarde el archivo localmente
      delete req.file
    }
    
    return data
  }
}
```

#### **afterDelete Hook**
```typescript
export const afterDeleteHook = (options: BytescalePluginOptions) => {
  return async ({ doc }) => {
    // Si el documento tiene bytescaleKey, eliminarlo de Bytescale
    if (doc.bytescaleKey) {
      const adapter = new BytescaleAdapter(options)
      
      try {
        await adapter.delete(doc.bytescaleKey)
      } catch (error) {
        console.warn(`Failed to delete file from Bytescale: ${doc.bytescaleKey}`, error)
      }
    }
    
    return doc
  }
}
```

#### **afterRead Hook**
```typescript
export const afterReadHook = (options: BytescalePluginOptions) => {
  return async ({ doc }) => {
    // Generar URL pública actualizada si tiene bytescaleKey
    if (doc.bytescaleKey) {
      const adapter = new BytescaleAdapter(options)
      doc.url = adapter.getPublicUrl(doc.bytescaleKey)
      
      // Generar URLs para thumbnails si existen
      if (doc.sizes) {
        Object.keys(doc.sizes).forEach(sizeName => {
          if (doc.sizes[sizeName].bytescaleKey) {
            doc.sizes[sizeName].url = adapter.getPublicUrl(
              doc.sizes[sizeName].bytescaleKey
            )
          }
        })
      }
    }
    
    return doc
  }
}
```

---

## 📦 Dependencias Requeridas

### **NPM Packages**

```json
{
  "dependencies": {
    "@bytescale/sdk": "^3.x",
    "node-fetch": "^2.7.0"
  },
  "devDependencies": {
    "@types/node-fetch": "^2.6.11"
  }
}
```

---

## ⚙️ Configuración

### **1. Variables de Entorno**

Agregar a `env.mjs`:

```typescript
export const env = createEnv({
  server: {
    // ... existing vars
    
    // Bytescale Configuration
    BYTESCALE_API_KEY: z.string().min(1),
    BYTESCALE_ACCOUNT_ID: z.string().min(1),
    BYTESCALE_PREFIX: z.string().optional().default('/payload-uploads'),
  },
})
```

Agregar a `.env.local`:

```bash
# Bytescale Configuration
BYTESCALE_API_KEY=your_api_key_here
BYTESCALE_ACCOUNT_ID=your_account_id_here
BYTESCALE_PREFIX=/payload-uploads
```

### **2. Payload Config Integration**

Modificar `payload.config.ts`:

```typescript
import { bytescaleUploadPlugin } from './src/plugins/bytescale-upload'

export default buildConfig({
  // ... existing config
  
  plugins: [
    bytescaleUploadPlugin({
      apiKey: process.env.BYTESCALE_API_KEY!,
      accountId: process.env.BYTESCALE_ACCOUNT_ID!,
      prefix: process.env.BYTESCALE_PREFIX,
      enabled: true, // Opción para habilitar/deshabilitar
    })
  ],
  
  collections: [
    {
      slug: 'media',
      upload: {
        // Mantener configuración de imageSizes
        // El plugin interceptará las operaciones
        imageSizes: [...],
        adminThumbnail: 'thumbnail',
        mimeTypes: ['image/*'],
      },
      fields: [
        {
          name: 'alt',
          type: 'text',
          required: true,
        },
        {
          name: 'bytescaleKey',
          type: 'text',
          admin: {
            readOnly: true,
            hidden: true, // Oculto en admin UI
          },
        },
      ],
    },
  ],
})
```

---

## 🎨 Características Adicionales

### **1. Image Transformations**

Bytescale ofrece transformaciones on-the-fly:

```typescript
// En afterRead hook, agregar URLs transformadas
doc.transformedUrls = {
  thumbnail: Bytescale.UrlBuilder.url({
    accountId: options.accountId,
    filePath: doc.bytescaleKey,
    options: {
      transformation: 'preset',
      transformationPreset: 'thumbnail'
    }
  }),
  optimized: Bytescale.UrlBuilder.url({
    accountId: options.accountId,
    filePath: doc.bytescaleKey,
    options: {
      transformation: 'image',
      transformationParams: {
        w: '800',
        h: '600',
        fit: 'crop'
      }
    }
  })
}
```

### **2. Caching Strategy**

```typescript
// Agregar headers de cache
export const urlWithCache = (fileKey: string, accountId: string) => {
  const url = Bytescale.UrlBuilder.url({
    accountId,
    filePath: fileKey,
  })
  
  return `${url}?cache-control=public,max-age=31536000,immutable`
}
```

### **3. Progress Tracking**

```typescript
// Para archivos grandes, reportar progreso
this.uploadManager.upload({
  data: fileBuffer,
  mime: mimeType,
  originalFileName: filename,
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress.uploadedBytes}/${progress.totalBytes}`)
  }
})
```

---

## 🚀 Plan de Implementación (Fases)

### **Fase 1: Setup Básico** ✅
- [ ] Instalar dependencias de Bytescale
- [ ] Crear estructura de directorios
- [ ] Agregar variables de entorno
- [ ] Crear tipos TypeScript

### **Fase 2: Adaptador Core** ⚙️
- [ ] Implementar `BytescaleAdapter`
- [ ] Métodos: `upload`, `delete`, `getPublicUrl`
- [ ] Normalización de paths
- [ ] Validación de opciones

### **Fase 3: Utilidades** 🛠️
- [ ] Decoder de Base64
- [ ] Logger personalizado
- [ ] Helpers de transformación

### **Fase 4: Hooks** 🪝
- [ ] `beforeChangeHook` - Interceptar uploads
- [ ] `afterDeleteHook` - Limpiar archivos
- [ ] `afterReadHook` - Generar URLs

### **Fase 5: Plugin Config** 📦
- [ ] Estructura del plugin
- [ ] Integración con Payload
- [ ] `extendCollections` logic

### **Fase 6: Image Processing** 🖼️
- [ ] Soporte para múltiples tamaños
- [ ] Thumbnails automáticos
- [ ] Transformaciones on-the-fly

### **Fase 7: Testing** 🧪
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Casos edge (archivos grandes, errores de red)

### **Fase 8: Documentación** 📚
- [ ] README del plugin
- [ ] Ejemplos de uso
- [ ] Troubleshooting guide

---

## 🔐 Consideraciones de Seguridad

1. **API Keys**: Nunca exponer en frontend, solo server-side
2. **Validación**: Validar tipos de archivo antes de subir
3. **Límites**: Implementar límites de tamaño de archivo
4. **Sanitización**: Sanitizar nombres de archivo

```typescript
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
}
```

---

## 📊 Ventajas vs Almacenamiento Local

| Característica | Local | Bytescale |
|---------------|-------|-----------|
| **Escalabilidad** | Limitada | Ilimitada |
| **CDN Global** | ❌ | ✅ |
| **Transformaciones** | Manual | Automáticas |
| **Backups** | Manual | Automáticos |
| **Costo** | Servidor | Pay-as-you-go |
| **Performance** | Variable | Optimizado |

---

## 🎯 Próximos Pasos

1. ✅ Revisar y aprobar este plan
2. ⏳ Instalar dependencias de Bytescale
3. ⏳ Crear estructura de archivos base
4. ⏳ Implementar BytescaleAdapter
5. ⏳ Implementar hooks uno por uno
6. ⏳ Integrar con payload.config.ts
7. ⏳ Testing exhaustivo

---

## 📝 Notas Importantes

- **Compatibilidad**: Payload CMS 3.x
- **Node Version**: >= 18.x (para soporte de fetch nativo)
- **Bun**: Totalmente compatible
- **TypeScript**: Tipado completo
- **Zero-Config**: Funciona out-of-the-box después de configurar env vars

---

**¿Listo para implementar?** 🚀

Podemos comenzar con la Fase 1 y avanzar paso a paso.

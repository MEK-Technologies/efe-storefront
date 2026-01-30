# Bytescale Plugin Tests

Suite completa de tests para el plugin de Bytescale.

## 📋 Tests Disponibles

### 1. **bytescale-adapter.test.ts**
Tests del adaptador core de Bytescale:
- ✅ Inicialización y validación de opciones
- ✅ Upload de archivos (texto e imágenes)
- ✅ Generación de URLs públicas
- ✅ Transformaciones de imágenes (resize, format, quality)
- ✅ Eliminación de archivos

### 2. **utils.test.ts**
Tests de utilidades:
- ✅ Normalización de paths
- ✅ Sanitización de nombres de archivo
- ✅ Generación de timestamps únicos
- ✅ Detección de Base64
- ✅ Decodificación de Base64 y Data URIs
- ✅ Extracción de MIME types

### 3. **handlers.test.ts**
Tests del manejador de uploads:
- ✅ Upload con Buffer
- ✅ Upload con Base64
- ✅ Upload con Data URIs
- ✅ Sanitización de nombres
- ✅ Generación de nombres únicos
- ✅ Manejo de errores

### 4. **hooks.test.ts**
Tests de hooks de Payload CMS:
- ✅ beforeChange: Interceptar uploads
- ✅ afterDelete: Limpieza de archivos
- ✅ afterRead: Generación de URLs
- ✅ Manejo de image sizes
- ✅ Casos edge (null, sin bytescaleKey, etc.)

### 5. **plugin-integration.test.ts**
Tests de integración del plugin completo:
- ✅ Validación de configuración
- ✅ Modificación de colecciones
- ✅ Adición de campos (bytescaleKey)
- ✅ Adición de hooks
- ✅ Preservación de hooks existentes
- ✅ Múltiples colecciones con upload

## 🚀 Ejecutar Tests

### Todos los tests:
```bash
bun run test:unit
```

### Tests en modo watch:
```bash
bun run test:unit:watch
```

### Test individual:
```bash
bun test src/plugins/bytescale-upload/__tests__/utils.test.ts
```

### Tests con conexión real a Bytescale:
```bash
# Asegúrate de tener las variables configuradas en .env.local:
# BYTESCALE_API_KEY=...
# BYTESCALE_ACCOUNT_ID=...

bun run test:bytescale:all
```

## 📊 Tipos de Tests

### Tests Unitarios (Unit Tests)
No requieren conexión a Bytescale. Prueban la lógica interna:
- Validación de inputs
- Transformación de datos
- Generación de URLs
- Manejo de errores

### Tests de Integración (Integration Tests)
Requieren credenciales de Bytescale reales:
- Upload real de archivos
- Eliminación real de archivos
- Verificación de URLs públicas

**Nota:** Los tests de integración se saltan automáticamente si no hay credenciales configuradas.

## 🔍 Cobertura de Tests

Los tests cubren:
- ✅ Casos exitosos (happy path)
- ✅ Validación de inputs
- ✅ Manejo de errores
- ✅ Casos edge (null, undefined, vacío)
- ✅ Sanitización y normalización
- ✅ Integración con Payload CMS

## 📝 Estructura de Tests

```
__tests__/
├── bytescale-adapter.test.ts    # Core adapter
├── utils.test.ts                 # Utilidades
├── handlers.test.ts              # Upload handlers
├── hooks.test.ts                 # Payload hooks
├── plugin-integration.test.ts    # Plugin completo
└── README.md                     # Esta documentación
```

## ⚡ Tips

1. **Tests rápidos:** Ejecuta solo tests unitarios (no requieren red):
   ```bash
   bun test src/plugins/bytescale-upload/__tests__/utils.test.ts
   ```

2. **Tests con credenciales:** Exporta las variables antes de ejecutar:
   ```bash
   export BYTESCALE_API_KEY="your-key"
   export BYTESCALE_ACCOUNT_ID="your-id"
   bun run test:bytescale:all
   ```

3. **Debug de tests:** Agrega `debug: true` en las opciones del test.

## 🐛 Troubleshooting

### "Tests skip" o "no credentials"
- Los tests de integración requieren `BYTESCALE_API_KEY` y `BYTESCALE_ACCOUNT_ID`
- Configúralos en `.env.local` o expórtalos en el terminal

### Timeout errors
- Aumenta el timeout en tests individuales (ya está configurado a 10s)
- Verifica tu conexión a internet

### "File not found" errors
- Asegúrate de ejecutar desde la raíz del proyecto
- Los paths son relativos al workspace root

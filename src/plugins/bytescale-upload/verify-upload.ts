/**
 * Verificación Manual de Upload
 * 
 * Este script hace un upload REAL y NO lo elimina,
 * para que puedas verificar manualmente en tu dashboard de Bytescale
 * 
 * Run: bun run verify:bytescale
 */

import { BytescaleAdapter } from './bytescale-adapter'
import type { BytescalePluginOptions } from './types'

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function verifyUpload() {
  log('\n🔍 Verificación REAL de Bytescale\n', 'cyan')
  log('Este test NO elimina el archivo, para que puedas verificar en Bytescale Dashboard\n', 'yellow')

  const apiKey = process.env.BYTESCALE_API_KEY
  const accountId = process.env.BYTESCALE_ACCOUNT_ID
  const prefix = process.env.BYTESCALE_PREFIX || '/payload-uploads'

  if (!apiKey || !accountId) {
    log('❌ Faltan variables de entorno', 'red')
    process.exit(1)
  }

  const options: BytescalePluginOptions = {
    apiKey,
    accountId,
    prefix,
    enabled: true,
    debug: false, // Sin logs para salida limpia
  }

  try {
    const adapter = new BytescaleAdapter(options)

    // Crear un archivo de verificación con timestamp único
    const timestamp = new Date().toISOString()
    const testContent = `VERIFICACIÓN REAL DE BYTESCALE
    
Timestamp: ${timestamp}
Este archivo fue subido usando la API REAL de Bytescale.

Si puedes ver este archivo en:
1. Tu dashboard de Bytescale (https://www.bytescale.com/dashboard)
2. La URL pública que se muestra abajo

Entonces la conexión es 100% REAL y funcional.

No es una simulación ni mock.
`
    
    const filename = `verification-${Date.now()}.txt`
    const buffer = Buffer.from(testContent, 'utf-8')

    log('📤 Subiendo archivo de verificación...', 'blue')
    log(`   Nombre: ${filename}`, 'cyan')
    log(`   Tamaño: ${buffer.length} bytes`, 'cyan')
    log(`   Destino: ${prefix}\n`, 'cyan')

    const result = await adapter.upload(buffer, filename, 'text/plain')

    log('━'.repeat(60), 'green')
    log('✅ UPLOAD REAL COMPLETADO', 'green')
    log('━'.repeat(60), 'green')
    
    log('\n📍 Detalles del archivo:', 'cyan')
    log(`   File Key: ${result.fileKey}`, 'magenta')
    log(`   URL: ${result.url}\n`, 'magenta')

    log('🔗 VERIFICA MANUALMENTE:', 'yellow')
    log('   1. Abre tu Bytescale Dashboard: https://www.bytescale.com/dashboard', 'yellow')
    log(`   2. O visita la URL directa: ${result.url}`, 'yellow')
    log('   3. Deberías ver el contenido del archivo de verificación\n', 'yellow')

    log('🗑️  Para eliminar este archivo de prueba:', 'cyan')
    log(`   bun run src/plugins/bytescale-upload/delete-file.ts ${result.fileKey}\n`, 'cyan')

    log('✨ Si puedes ver el archivo, la conexión es REAL.', 'green')
    log('   No hay simulación ni mocks involucrados.\n', 'green')

  } catch (error) {
    log('\n❌ ERROR:', 'red')
    console.error(error)
    process.exit(1)
  }
}

verifyUpload().catch((error) => {
  console.error('Error inesperado:', error)
  process.exit(1)
})

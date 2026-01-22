/**
 * Eliminar archivo de Bytescale
 * 
 * Usage: bun run src/plugins/bytescale-upload/delete-file.ts <fileKey>
 */

import { BytescaleAdapter } from './bytescale-adapter'

const fileKey = process.argv[2]

if (!fileKey) {
  console.error('❌ Uso: bun run delete-file.ts <fileKey>')
  console.error('Ejemplo: bun run delete-file.ts /uploads/2026/01/22/4jDGmDRn5N-file.txt')
  process.exit(1)
}

const apiKey = process.env.BYTESCALE_API_KEY
const accountId = process.env.BYTESCALE_ACCOUNT_ID

if (!apiKey || !accountId) {
  console.error('❌ Faltan variables de entorno')
  process.exit(1)
}

const adapter = new BytescaleAdapter({
  apiKey,
  accountId,
  enabled: true,
})

console.log(`🗑️  Eliminando: ${fileKey}`)

adapter.delete(fileKey)
  .then(() => {
    console.log('✅ Archivo eliminado')
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

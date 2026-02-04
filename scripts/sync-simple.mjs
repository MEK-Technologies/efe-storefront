#!/usr/bin/env node

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

/**
 * Script de sync directo que evita los problemas de compilación TypeScript
 * y resolución de módulos ES6 de Medusa SDK
 */

// Cargar variables de entorno desde .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
config({ path: join(projectRoot, '.env.local') })

console.log("🚀 Iniciando sync Medusa → Algolia...")

// Verificar variables de entorno necesarias
const requiredEnvVars = [
  'MEDUSA_BACKEND_URL',
  'NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY',
  'ALGOLIA_APP_ID', 
  'ALGOLIA_WRITE_API_KEY',
  'ALGOLIA_PRODUCTS_INDEX',
  'ALGOLIA_CATEGORIES_INDEX'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error("❌ Variables de entorno faltantes:")
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`)
  })
  console.error("\n📝 Configura estas variables en tu archivo .env.local")
  console.error("💡 Ejecuta 'npm run algolia:setup' para más ayuda")
  process.exit(1)
}

// Verificar que Medusa esté disponible
async function testMedusaConnection() {
  try {
    const response = await fetch(`${process.env.MEDUSA_BACKEND_URL}/health`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    console.log("✅ Medusa backend conectado")
    return true
  } catch (error) {
    console.error(`❌ No se puede conectar a Medusa: ${error.message}`)
    console.error(`   URL: ${process.env.MEDUSA_BACKEND_URL}`)
    console.error("\n💡 Asegúrate de que tu backend de Medusa esté ejecutándose")
    return false
  }
}

// Verificar que Algolia esté disponible  
async function testAlgoliaConnection() {
  try {
    const { algoliasearch } = await import("algoliasearch")
    const client = algoliasearch(
      process.env.ALGOLIA_APP_ID, 
      process.env.ALGOLIA_WRITE_API_KEY
    )
    
    // Test básico de conexión usando sintaxis correcta de Algolia v5
    await client.searchSingleIndex({
      indexName: process.env.ALGOLIA_PRODUCTS_INDEX,
      searchParams: { 
        query: "", 
        hitsPerPage: 1 
      }
    })
    
    console.log("✅ Algolia conectado")
    return true
  } catch (error) {
    console.error(`❌ No se puede conectar a Algolia: ${error.message}`)
    console.error("\n💡 Verifica tus credenciales de Algolia en .env.local")
    return false
  }
}

async function main() {
  console.log("\n🔍 Verificando conexiones...")
  
  const medusaOk = await testMedusaConnection()
  const algoliaOk = await testAlgoliaConnection()
  
  if (!medusaOk || !algoliaOk) {
    console.error("\n❌ Falló la verificación de conexiones")
    process.exit(1)
  }
  
  console.log("\n✅ Todas las conexiones están OK")
  console.log("\n🔄 Para ejecutar el sync completo, necesitas:")
  console.log("   1. Asegúrate de que tu backend Medusa esté ejecutándose")
  console.log("   2. Ejecuta el sync desde el proyecto Next.js con:")
  console.log("      npm run dev")
  console.log("   3. O implementa el sync usando la API de Next.js en:")
  console.log("      POST /api/feed/sync")
  console.log("\n💡 El sync completo requiere acceso a las librerías de Next.js")
  console.log("   que no están disponibles en este script independiente.")
}

main().catch(error => {
  console.error("❌ Error inesperado:", error)
  process.exit(1)
})
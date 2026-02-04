#!/usr/bin/env node

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Cargar variables de entorno desde .env.local o .env
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
config({ path: join(projectRoot, '.env.local') })
config({ path: join(projectRoot, '.env') })

const env = {
  ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
  ALGOLIA_WRITE_API_KEY: process.env.ALGOLIA_WRITE_API_KEY,
  ALGOLIA_SEARCH_API_KEY: process.env.ALGOLIA_SEARCH_API_KEY,
  ALGOLIA_PRODUCTS_INDEX: process.env.ALGOLIA_PRODUCTS_INDEX,
  ALGOLIA_CATEGORIES_INDEX: process.env.ALGOLIA_CATEGORIES_INDEX,
  ALGOLIA_REVIEWS_INDEX: process.env.ALGOLIA_REVIEWS_INDEX,
}

function isAlgoliaConfigured() {
  return !!(
    env.ALGOLIA_APP_ID &&
    env.ALGOLIA_WRITE_API_KEY &&
    env.ALGOLIA_PRODUCTS_INDEX &&
    env.ALGOLIA_CATEGORIES_INDEX
  )
}

function getAlgoliaConfig() {
  return {
    appId: env.ALGOLIA_APP_ID,
    apiKey: env.ALGOLIA_WRITE_API_KEY,
    searchApiKey: env.ALGOLIA_SEARCH_API_KEY,
    productsIndex: env.ALGOLIA_PRODUCTS_INDEX,
    categoriesIndex: env.ALGOLIA_CATEGORIES_INDEX,
    reviewsIndex: env.ALGOLIA_REVIEWS_INDEX,
  }
}

async function validateAlgoliaSetup() {
  console.log("🔍 Validando configuración de Algolia...")
  
  const config = getAlgoliaConfig()
  
  console.log("\n📋 Estado de variables de entorno:")
  console.log(`✅ ALGOLIA_APP_ID: ${config.appId ? "✓ Configurado (" + config.appId + ")" : "❌ Faltante"}`)
  console.log(`✅ ALGOLIA_WRITE_API_KEY: ${config.apiKey ? "✓ Configurado (***" + config.apiKey.slice(-4) + ")" : "❌ Faltante"}`)
  console.log(`✅ ALGOLIA_SEARCH_API_KEY: ${config.searchApiKey ? "✓ Configurado (***" + config.searchApiKey.slice(-4) + ")" : "⚠️  Recomendado para seguridad"}`)
  console.log(`✅ ALGOLIA_PRODUCTS_INDEX: ${config.productsIndex ? "✓ " + config.productsIndex : "❌ Faltante"}`)
  console.log(`✅ ALGOLIA_CATEGORIES_INDEX: ${config.categoriesIndex ? "✓ " + config.categoriesIndex : "❌ Faltante"}`)
  console.log(`🔄 ALGOLIA_REVIEWS_INDEX: ${config.reviewsIndex ? "✓ " + config.reviewsIndex : "⚠️  Opcional (no configurado)"}`)
  
  if (!isAlgoliaConfigured()) {
    console.log("\n❌ Algolia NO está completamente configurado")
    console.log("\n📝 Para configurar Algolia:")
    console.log("1. Copia .env.example a .env.local:")
    console.log("   cp .env.example .env.local")
    console.log("\n2. Obtén tus credenciales de Algolia:")
    console.log("   - Ve a https://www.algolia.com/dashboard")
    console.log("   - Crea una aplicación si no tienes una")
    console.log("   - Ve a Settings > API Keys")
    console.log("\n3. Configura las variables en .env (o .env.local):")
    console.log("   ALGOLIA_APP_ID=tu-app-id")
    console.log("   ALGOLIA_WRITE_API_KEY=tu-admin-api-key")
    console.log("   ALGOLIA_SEARCH_API_KEY=tu-search-only-api-key  # Más seguro")
    console.log("   ALGOLIA_PRODUCTS_INDEX=products")
    console.log("   ALGOLIA_CATEGORIES_INDEX=categories")
    console.log("\n   ⚠️  IMPORTANTE: SEARCH_API_KEY debe tener permisos de solo lectura")
    console.log("   ⚠️  WRITE_API_KEY nunca debe exponerse al frontend")
    console.log("\n4. Ejecuta el sync inicial:")
    console.log("   npm run algolia:sync")
    return false
  }
  
  console.log("\n✅ Algolia está completamente configurado")
  return true
}

async function testAlgoliaConnection() {
  console.log("\n🔗 Probando conexión con Algolia...")
  
  try {
    const { algoliasearch } = await import("algoliasearch")
    
    const client = algoliasearch(env.ALGOLIA_APP_ID || "", env.ALGOLIA_WRITE_API_KEY || "")
    
    // Test basic search usando sintaxis correcta de Algolia v5
    const result = await client.searchSingleIndex({
      indexName: env.ALGOLIA_PRODUCTS_INDEX || "products",
      searchParams: {
        query: "",
        hitsPerPage: 1
      }
    })
    
    console.log("✅ Conexión con Algolia exitosa")
    console.log(`📊 Índice ${env.ALGOLIA_PRODUCTS_INDEX}: ${result.nbHits || 0} productos encontrados`)
    
    // Validar réplicas de índices
    await validateIndexReplicas(client)
    
    return true
  } catch (error) {
    console.error("❌ Error conectando con Algolia:", error.message || error)
    return false
  }
}

async function validateIndexReplicas(client) {
  console.log("\n🔍 Validando réplicas de índices...")
  
  try {
    const productsIndex = env.ALGOLIA_PRODUCTS_INDEX || "products"
    const expectedReplicas = [
      `${productsIndex}_price_asc`,
      `${productsIndex}_price_desc`,
      `${productsIndex}_rating_desc`,
      `${productsIndex}_updated_asc`,
      `${productsIndex}_updated_desc`,
    ]
    
    // Listar todos los índices
    const { items: indices } = await client.listIndices()
    const indexNames = indices.map(idx => idx.name)
    
    console.log(`\n📊 Índices encontrados: ${indexNames.length}`)
    
    const missingReplicas = expectedReplicas.filter(replica => !indexNames.includes(replica))
    
    if (missingReplicas.length > 0) {
      console.log("\n⚠️  Réplicas faltantes para ordenamiento:")
      missingReplicas.forEach(replica => console.log(`   - ${replica}`))
      console.log("\n💡 Crea estas réplicas en el dashboard de Algolia:")
      console.log("   https://www.algolia.com/apps/" + env.ALGOLIA_APP_ID + "/indices")
      console.log("\n   Configuración recomendada por réplica:")
      console.log("   - price_asc: Ranking por minPrice ascendente")
      console.log("   - price_desc: Ranking por minPrice descendente")
      console.log("   - rating_desc: Ranking por avgRating descendente")
      console.log("   - updated_asc/desc: Ranking por updatedAtTimestamp")
    } else {
      console.log("✅ Todas las réplicas necesarias están configuradas")
    }
    
    return missingReplicas.length === 0
  } catch (error) {
    console.log("⚠️  No se pudieron validar las réplicas:", error.message)
    return false
  }
}

async function runSync() {
  console.log("\n🔄 Para ejecutar sync, usa el comando dedicado:")
  console.log("   npm run sync:algolia")
  console.log("\nEste script solo valida la configuración.")
  return true
}

async function main() {
  console.log("🚀 Utilidad de configuración de Algolia\n")
  
  const command = process.argv[2]
  
  switch (command) {
    case "validate":
    case "check":
      await validateAlgoliaSetup()
      break
      
    case "test":
      const isConfigured = await validateAlgoliaSetup()
      if (isConfigured) {
        await testAlgoliaConnection()
      }
      break
      
    case "sync":
      const isReady = await validateAlgoliaSetup()
      if (isReady) {
        const canConnect = await testAlgoliaConnection()
        if (canConnect) {
          await runSync()
        }
      }
      break
      
    case "setup":
    default:
      const setupOk = await validateAlgoliaSetup()
      if (setupOk) {
        const connected = await testAlgoliaConnection()
        if (connected) {
          console.log("\n🎉 Todo listo! Puedes ejecutar:")
          console.log("   npm run sync:algolia  # Para sincronizar datos")
          console.log("   npm run algolia:test  # Para probar la conexión")
        }
      }
      break
  }
}

main().catch(console.error)
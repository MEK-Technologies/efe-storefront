#!/usr/bin/env node

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname)
config({ path: join(projectRoot, '.env.local') })
config({ path: join(projectRoot, '.env') })

console.log("🧪 Probando consultas de Algolia con índice efe-products\n")

async function testQueries() {
  const { algoliasearch } = await import("algoliasearch")
  
  const client = algoliasearch(
    process.env.ALGOLIA_APP_ID,
    process.env.ALGOLIA_SEARCH_API_KEY || process.env.ALGOLIA_WRITE_API_KEY
  )
  
  const indexName = process.env.ALGOLIA_PRODUCTS_INDEX || 'efe-products'
  
  console.log(`📦 Usando índice: ${indexName}\n`)
  
  // Test 1: Búsqueda simple
  console.log("1️⃣ Búsqueda simple (todos los productos):")
  try {
    const result = await client.searchSingleIndex({
      indexName,
      searchParams: { 
        query: '', 
        hitsPerPage: 5,
        attributesToRetrieve: ['title', 'handle', 'minPrice']
      }
    })
    console.log(`   ✅ Total productos: ${result.nbHits}`)
    console.log(`   📋 Primeros 3 productos:`)
    result.hits.slice(0, 3).forEach((hit, i) => {
      console.log(`      ${i+1}. ${hit.title} (handle: ${hit.handle})`)
    })
  } catch (error) {
    console.log(`   ❌ Error:`, error.message)
  }
  
  // Test 2: Búsqueda por texto
  console.log("\n2️⃣ Búsqueda por texto (query: 'ice'):")
  try {
    const result = await client.searchSingleIndex({
      indexName,
      searchParams: { 
        query: 'ice', 
        hitsPerPage: 3,
        attributesToRetrieve: ['title', 'handle']
      }
    })
    console.log(`   ✅ Resultados encontrados: ${result.hits.length}`)
    result.hits.forEach((hit, i) => {
      console.log(`      ${i+1}. ${hit.title}`)
    })
  } catch (error) {
    console.log(`   ❌ Error:`, error.message)
  }
  
  // Test 3: Búsqueda por handle
  console.log("\n3️⃣ Búsqueda por handle específico:")
  try {
    const result = await client.searchSingleIndex({
      indexName,
      searchParams: { 
        filters: 'handle:"ice-king"',
        hitsPerPage: 1
      }
    })
    if (result.hits.length > 0) {
      console.log(`   ✅ Producto encontrado: ${result.hits[0].title}`)
      console.log(`   📝 Handle: ${result.hits[0].handle}`)
    } else {
      console.log(`   ⚠️  No se encontró producto con handle "ice-king"`)
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message)
  }
  
  // Test 4: Verificar réplicas
  console.log("\n4️⃣ Verificando réplicas de ordenamiento:")
  const replicas = [
    'efe-products_price_asc',
    'efe-products_price_desc',
    'efe-products_rating_desc',
    'efe-products_updated_asc',
    'efe-products_updated_desc'
  ]
  
  for (const replica of replicas) {
    try {
      const result = await client.searchSingleIndex({
        indexName: replica,
        searchParams: { query: '', hitsPerPage: 1 }
      })
      console.log(`   ✅ ${replica}: OK (${result.nbHits} productos)`)
    } catch (error) {
      console.log(`   ❌ ${replica}: Error - ${error.message}`)
    }
  }
  
  // Test 5: Filtros avanzados
  console.log("\n5️⃣ Filtros avanzados (precio > 0):")
  try {
    const result = await client.searchSingleIndex({
      indexName,
      searchParams: { 
        filters: 'minPrice > 0',
        hitsPerPage: 3,
        attributesToRetrieve: ['title', 'minPrice']
      }
    })
    console.log(`   ✅ Productos con precio: ${result.hits.length}`)
    result.hits.forEach((hit, i) => {
      console.log(`      ${i+1}. ${hit.title} - $${hit.minPrice}`)
    })
  } catch (error) {
    console.log(`   ❌ Error:`, error.message)
  }
  
  console.log("\n✅ Tests completados!")
}

testQueries().catch(console.error)

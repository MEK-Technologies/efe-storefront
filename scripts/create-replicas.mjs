#!/usr/bin/env node

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
config({ path: join(projectRoot, '.env.local') })
config({ path: join(projectRoot, '.env') })

const env = {
  ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
  ALGOLIA_WRITE_API_KEY: process.env.ALGOLIA_WRITE_API_KEY,
  ALGOLIA_PRODUCTS_INDEX: process.env.ALGOLIA_PRODUCTS_INDEX || 'products',
}

async function createReplicas() {
  console.log("🎨 Creando réplicas de índices en Algolia...\n")
  
  if (!env.ALGOLIA_APP_ID || !env.ALGOLIA_WRITE_API_KEY) {
    console.error("❌ Faltan credenciales de Algolia")
    console.log("Asegúrate de tener ALGOLIA_APP_ID y ALGOLIA_WRITE_API_KEY configurados")
    process.exit(1)
  }

  try {
    const { algoliasearch } = await import("algoliasearch")
    const client = algoliasearch(env.ALGOLIA_APP_ID, env.ALGOLIA_WRITE_API_KEY)
    
    const productsIndex = env.ALGOLIA_PRODUCTS_INDEX
    
    const replicas = [
      {
        name: `${productsIndex}_price_asc`,
        ranking: ["asc(minPrice)", "typo", "geo", "words", "filters", "proximity", "attribute", "exact", "custom"],
        description: "Productos ordenados por precio ascendente"
      },
      {
        name: `${productsIndex}_price_desc`,
        ranking: ["desc(minPrice)", "typo", "geo", "words", "filters", "proximity", "attribute", "exact", "custom"],
        description: "Productos ordenados por precio descendente"
      },
      {
        name: `${productsIndex}_rating_desc`,
        ranking: ["desc(avgRating)", "typo", "geo", "words", "filters", "proximity", "attribute", "exact", "custom"],
        description: "Productos ordenados por rating descendente"
      },
      {
        name: `${productsIndex}_updated_asc`,
        ranking: ["asc(updatedAtTimestamp)", "typo", "geo", "words", "filters", "proximity", "attribute", "exact", "custom"],
        description: "Productos ordenados por fecha de actualización ascendente"
      },
      {
        name: `${productsIndex}_updated_desc`,
        ranking: ["desc(updatedAtTimestamp)", "typo", "geo", "words", "filters", "proximity", "attribute", "exact", "custom"],
        description: "Productos ordenados por fecha de actualización descendente"
      },
    ]
    
    console.log(`📦 Índice principal: ${productsIndex}`)
    console.log(`🎯 Réplicas a crear: ${replicas.length}\n`)
    
    for (const replica of replicas) {
      try {
        console.log(`📝 Creando réplica: ${replica.name}...`)
        
        // Crear la réplica
        await client.setSettings({
          indexName: productsIndex,
          indexSettings: {
            replicas: [replica.name],
          }
        })
        
        // Configurar ranking de la réplica
        await client.setSettings({
          indexName: replica.name,
          indexSettings: {
            ranking: replica.ranking,
          }
        })
        
        console.log(`✅ Réplica ${replica.name} creada exitosamente`)
      } catch (error) {
        // Si ya existe, actualizar configuración
        if (error.message && error.message.includes('already exists')) {
          console.log(`⚠️  Réplica ${replica.name} ya existe, actualizando configuración...`)
          
          await client.setSettings({
            indexName: replica.name,
            indexSettings: {
              ranking: replica.ranking,
            }
          })
          
          console.log(`✅ Réplica ${replica.name} actualizada`)
        } else {
          console.error(`❌ Error creando ${replica.name}:`, error.message)
        }
      }
    }
    
    console.log("\n🎉 Proceso completado!")
    console.log("\n📝 Próximo paso:")
    console.log("   bun run algolia:sync  # Para sincronizar productos")
    
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

createReplicas().catch(console.error)

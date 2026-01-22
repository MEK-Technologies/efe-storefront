/**
 * List files in Bytescale
 * 
 * Usage: bun run src/plugins/bytescale-upload/list-files.ts
 */

const apiKey = process.env.BYTESCALE_API_KEY
const accountId = process.env.BYTESCALE_ACCOUNT_ID

if (!apiKey || !accountId) {
  console.error('❌ Faltan BYTESCALE_API_KEY y/o BYTESCALE_ACCOUNT_ID')
  process.exit(1)
}

async function listFiles() {
  try {
    console.log('📂 Listando archivos en Bytescale...\n')
    console.log(`🔗 Dashboard: https://www.bytescale.com/dashboard/${accountId}\n`)

    // Usar la API REST de Bytescale directamente
    const response = await fetch(
      `https://api.bytescale.com/v2/accounts/${accountId}/folders?folderPath=/payload-uploads`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    )

    if (response.status === 404) {
      console.log('📭 La carpeta /payload-uploads no existe aún')
      console.log('\n✨ Se creará automáticamente cuando subas el primer archivo')
      console.log('\n🧪 Para probar el plugin:')
      console.log('  1. Sube un archivo de prueba:')
      console.log('     bun run verify:bytescale')
      console.log('\n  O sube desde Payload:')
      console.log('  1. Ve a http://localhost:3000/admin')
      console.log('  2. Collections > Media > Create New')
      console.log('  3. Sube una imagen')
      console.log('  4. Se guardará automáticamente en Bytescale ✨\n')
      return
    }

    if (!response.ok) {
      console.error(`❌ Error HTTP: ${response.status}`)
      const text = await response.text()
      console.error(text)
      return
    }

    const data = await response.json() as any

    if (data.items && data.items.length > 0) {
      console.log(`✅ Encontrados ${data.items.length} archivo(s) en /payload-uploads:\n`)
      
      data.items.forEach((item: any, index: number) => {
        const icon = item.type === 'Folder' ? '📁' : '📄'
        console.log(`${index + 1}. ${icon} ${item.filePath}`)
        
        if (item.type === 'File') {
          console.log(`   📊 Tamaño: ${(item.size / 1024).toFixed(2)} KB`)
          console.log(`   📅 Modificado: ${new Date(item.lastModified).toLocaleString()}`)
          console.log(`   🔗 URL: https://upcdn.io/${accountId}/raw${item.filePath}`)
        }
        console.log('')
      })
      
      console.log(`\n📊 Total: ${data.items.length} archivo(s)`)
    } else {
      console.log('📭 No hay archivos en /payload-uploads (carpeta vacía)')
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message || error)
    console.log('\n💡 Verifica que:')
    console.log('  - BYTESCALE_API_KEY es correcto')
    console.log('  - BYTESCALE_ACCOUNT_ID es correcto')
    console.log('  - Tienes conexión a internet')
  }
}

listFiles()

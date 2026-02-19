
import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Load environment variables
dotenv.config({ path: path.resolve(dirname, '../.env.local') })

async function listTables() {
  const connectionString = process.env.PAYLOAD_DATABASE_URL
  
  if (!connectionString) {
    console.error('❌ PAYLOAD_DATABASE_URL is not defined used in .env.local')
    process.exit(1)
  }

  const client = new Client({
    connectionString,
  })

  try {
    await client.connect()
    console.log('🔌 Connected to database')

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `)

    console.log('\n📊 Tables found in database:')
    if (res.rows.length === 0) {
      console.log('No tables found.')
    } else {
      res.rows.forEach(row => {
        console.log(`- ${row.table_name}`)
      })
    }
    
    // Check specifically for addresses or similar
    const addressTables = res.rows.filter(r => 
      r.table_name.includes('address') || 
      r.table_name.includes('direccion')
    )

    if (addressTables.length > 0) {
      console.log('\n✅ Found potential address tables:', addressTables.map(t => t.table_name))
    } else {
      console.log('\n❌ No address/direccion tables found.')
    }

  } catch (err) {
    console.error('❌ Error listing tables:', err)
  } finally {
    await client.end()
    process.exit(0)
  }
}

listTables()


import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function fixSchema() {
  const connectionString = process.env.PAYLOAD_DATABASE_URL || 'postgres://admin:password@127.0.0.1:5432/payload'
  
  if (!connectionString) {
    console.error('❌ PAYLOAD_DATABASE_URL is not defined')
    process.exit(1)
  }

  const client = new Client({
    connectionString,
  })

  try {
    console.log('🔌 Connecting to database...')
    await client.connect()

    console.log('🛠️  Fixing schema for "payload_locked_documents_rels"...')
    
    // Check if the table and column exist
    const checkRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'payload_locked_documents_rels' 
      AND column_name = 'ordenes_id';
    `)

    if (checkRes.rows.length === 0) {
      console.log('⚠️  Column "ordenes_id" does not exist in "payload_locked_documents_rels". Skipping.')
    } else {
      const currentType = checkRes.rows[0].data_type
      console.log(`ℹ️  Current type: ${currentType}`)

      if (currentType !== 'text' && currentType !== 'character varying') {
        console.log('🔄 Converting "ordenes_id" to TEXT...')
        await client.query(`
            ALTER TABLE "payload_locked_documents_rels" 
            ALTER COLUMN "ordenes_id" TYPE TEXT;
        `)
        console.log('✅ Success: "ordenes_id" type changed to TEXT.')
      } else {
        console.log('✅ Column is already TEXT/VARCHAR. No action needed.')
      }
    }

  } catch (err: any) {
    console.error('❌ Error executing schema fix:', err.message)
    if (err.message.includes('does not exist')) {
        console.log('ℹ️  Table might not exist yet, which is fine if no locked documents caused this.')
    }
  } finally {
    await client.end()
    process.exit(0)
  }
}

fixSchema()

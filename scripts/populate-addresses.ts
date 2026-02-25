
import { Client } from 'pg'

const CONNECTION_STRING = "postgres://admin:password@184.105.7.21:5432/payload"

async function populateAddresses() {
  console.log("Starting address population...")
  
  const client = new Client({
    connectionString: CONNECTION_STRING,
  })

  try {
    await client.connect()
    console.log("🔌 Connected to database")
    
    // 1. Fetch orders with specific columns
    console.log("Fetching orders...")
    
    const query = `
      SELECT 
        id, 
        email, 
        created_at,
        direccion_envio_first_name,
        direccion_envio_last_name,
        direccion_envio_address_1,
        direccion_envio_address_2,
        direccion_envio_city,
        direccion_envio_province,
        direccion_envio_postal_code,
        direccion_envio_country_code,
        direccion_envio_phone,
        direccion_envio_company
      FROM "ordenes" 
      WHERE email = 'juanperez@gmail.com'
      ORDER BY "created_at" DESC 
    `
    // Filter applied for testing with specific email

    const ordersRes = await client.query(query)
    const orders = ordersRes.rows

    console.log(`Found ${orders.length} orders.`)
    if (orders.length > 0) {
      console.log("Sample order keys:", Object.keys(orders[0]))
      console.log("Sample order address:", {
        first: orders[0].direccion_envio_first_name,
        email: orders[0].email
      })
    }

    let newAddressesCount = 0
    let skippedAddressesCount = 0
    let errorCount = 0
    let missingInfoCount = 0

    // 2. Iterate over orders and extract addresses
    for (const order of orders) {
       // Construct address object directly from columns
       const addressData = {
          first_name: order.direccion_envio_first_name,
          last_name: order.direccion_envio_last_name,
          address_1: order.direccion_envio_address_1,
          address_2: order.direccion_envio_address_2,
          city: order.direccion_envio_city,
          province: order.direccion_envio_province,
          postal_code: order.direccion_envio_postal_code,
          country_code: order.direccion_envio_country_code || 'do',
          phone: order.direccion_envio_phone,
          company: order.direccion_envio_company
       }

      // Basic validation
      if (!addressData.first_name || !order.email) {
        missingInfoCount++
        // console.log(`Skipping order ${order.id}: Missing first_name or email`)
        continue
      }

      const email = order.email

      try {
          // 3. Check if addresses already exists
          const existingCheck = await client.query(
            `SELECT id FROM "addresses" WHERE "email" = $1 AND "address_1" = $2 AND "city" = $3 AND "country_code" = $4 LIMIT 1`,
            [email, addressData.address_1, addressData.city, addressData.country_code]
          )

          if (existingCheck.rowCount === 0) {
            // Construct insert query
            const now = new Date().toISOString()
            const insertQuery = `
              INSERT INTO "addresses" (
                "email",
                "first_name",
                "last_name",
                "address_1",
                "address_2",
                "city",
                "province",
                "postal_code",
                "country_code",
                "phone",
                "company",
                "is_default",
                "updated_at",
                "created_at"
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            `
            
            await client.query(insertQuery, [
                email,
                addressData.first_name,
                addressData.last_name,
                addressData.address_1,
                addressData.address_2 || null, 
                addressData.city,
                addressData.province || null,
                addressData.postal_code || null,
                addressData.country_code,
                addressData.phone || null,
                addressData.company || null,
                false, // is_default
                now,
                now
            ])
            
            newAddressesCount++
            process.stdout.write(".") // Progress dot
          } else {
            skippedAddressesCount++
          }
      } catch (innerError) {
          errorCount++
          console.error(`Error processing order ${order.id}:`, innerError)
      }
    }

    console.log("\nAddress population complete.")
    console.log(`Created: ${newAddressesCount}`)
    console.log(`Skipped (already existing): ${skippedAddressesCount}`)
    console.log(`Missing Info: ${missingInfoCount}`)
    console.log(`Errors: ${errorCount}`)

  } catch (error) {
    console.error("Fatal error populating addresses:", error)
  } finally {
    await client.end()
    process.exit(0)
  }
}

populateAddresses()

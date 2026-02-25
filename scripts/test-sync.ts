import { Client } from 'pg'

const PAYLOAD_DB_URL = "postgres://admin:password@184.105.7.21:5432/payload"

async function testSync(email: string) {
  console.log(`[TEST Sync] Buscando direcciones para: ${email}`)

  const client = new Client({
    connectionString: PAYLOAD_DB_URL,
  })
  
  await client.connect()
  console.log("[TEST Sync] Conectado a BD Payload")
  
  const query = `
    SELECT 
      id, 
      email, 
      first_name,
      last_name,
      address_1,
      address_2,
      city,
      province,
      postal_code,
      country_code,
      phone,
      company
    FROM "addresses" 
    WHERE email = $1
  `
  
  const res = await client.query(query, [email])
  const payloadAddresses = res.rows
  
  await client.end()
  
  console.log(`[TEST Sync] Encontradas ${payloadAddresses.length} direcciones en Payload`)
  
  if (payloadAddresses.length === 0) {
    return
  }
  
  for (const payloadAddr of payloadAddresses) {
      console.log(`\n--- Dirección Encontrada ---`)
      console.log(`first_name:   ${payloadAddr.first_name}`)
      console.log(`last_name:    ${payloadAddr.last_name}`)
      console.log(`address_1:    ${payloadAddr.address_1}`)
      console.log(`address_2:    ${payloadAddr.address_2}`)
      console.log(`city:         ${payloadAddr.city}`)
      console.log(`province:     ${payloadAddr.province}`)
      console.log(`postal_code:  ${payloadAddr.postal_code || "00000"}`)
      console.log(`country_code: ${payloadAddr.country_code || "do"}`)
      console.log(`phone:        ${payloadAddr.phone}`)
      console.log(`-----------------------------\n`)
  }
}

testSync('juanperez@gmail.com')

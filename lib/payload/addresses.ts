"use server"

import { Client } from "pg"
import { env } from "../../env.mjs"

// Use environment variable or fallback to standard connection
const PAYLOAD_DB_URL = env.PAYLOAD_DATABASE_URL || "postgres://admin:password@184.105.7.21:5432/payload"

export interface PayloadAddress {
  id: string
  email: string
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  province?: string
  postal_code?: string
  country_code: string
  phone?: string
  company?: string
  is_default: boolean
}

export type PayloadAddressInput = Omit<PayloadAddress, "id" | "email" | "is_default">

/**
 * Retrieves all addresses associated with a specific customer email.
 */
export async function listAddressesByEmail(email: string): Promise<PayloadAddress[]> {
  const client = new Client({ connectionString: PAYLOAD_DB_URL })
  
  try {
    await client.connect()
    
    const query = `
      SELECT 
        id, email, first_name, last_name, address_1, address_2,
        city, province, postal_code, country_code, phone, company, is_default
      FROM "addresses"
      WHERE email = $1
      ORDER BY created_at DESC
    `
    const res = await client.query(query, [email])
    
    return res.rows.map(row => ({
        ...row,
        // Ensure booleans are correctly typed
        is_default: Boolean(row.is_default)
    }))
  } catch (error) {
    console.error(`[Payload DB] Error listando direcciones para ${email}:`, error)
    return []
  } finally {
    await client.end()
  }
}

/**
 * Creates a new address for a specific customer.
 */
export async function createPayloadAddress(email: string, address: PayloadAddressInput): Promise<PayloadAddress | null> {
    const client = new Client({ connectionString: PAYLOAD_DB_URL })
    
    try {
      await client.connect()
      
      const now = new Date().toISOString()
      const query = `
        INSERT INTO "addresses" (
          email, first_name, last_name, address_1, address_2,
          city, province, postal_code, country_code, phone, company, 
          is_default, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
        ) RETURNING *
      `
      
      const values = [
        email,
        address.first_name,
        address.last_name,
        address.address_1,
        address.address_2 || null,
        address.city,
        address.province || null,
        address.postal_code || null,
        address.country_code,
        address.phone || null,
        address.company || null,
        false, // By default non-primary
        now,
        now
      ]
  
      const res = await client.query(query, values)
      return res.rows[0] as PayloadAddress
    } catch (error) {
      console.error(`[Payload DB] Error creando dirección para ${email}:`, error)
      throw error // Re-throw to inform frontend
    } finally {
      await client.end()
    }
}

/**
 * Updates an existing address in Payload.
 */
export async function updatePayloadAddress(id: string, address: PayloadAddressInput): Promise<PayloadAddress | null> {
    const client = new Client({ connectionString: PAYLOAD_DB_URL })
    
    try {
      await client.connect()
      
      const now = new Date().toISOString()
      const query = `
        UPDATE "addresses" SET
          first_name = $1, last_name = $2, address_1 = $3, address_2 = $4,
          city = $5, province = $6, postal_code = $7, country_code = $8, 
          phone = $9, company = $10, updated_at = $11
        WHERE id = $12
        RETURNING *
      `
      
      const values = [
        address.first_name,
        address.last_name,
        address.address_1,
        address.address_2 || null,
        address.city,
        address.province || null,
        address.postal_code || null,
        address.country_code,
        address.phone || null,
        address.company || null,
        now,
        id
      ]
  
      const res = await client.query(query, values)
      return res.rows[0] as PayloadAddress
    } catch (error) {
      console.error(`[Payload DB] Error actualizando dirección ${id}:`, error)
      throw error
    } finally {
      await client.end()
    }
}

/**
 * Deletes an address from Payload.
 */
export async function deletePayloadAddress(id: string): Promise<boolean> {
    const client = new Client({ connectionString: PAYLOAD_DB_URL })
    
    try {
      await client.connect()
      
      const query = `DELETE FROM "addresses" WHERE id = $1`
      const res = await client.query(query, [id])
      
      return (res.rowCount ?? 0) > 0
    } catch (error) {
      console.error(`[Payload DB] Error borrando dirección ${id}:`, error)
      return false
    } finally {
      await client.end()
    }
}

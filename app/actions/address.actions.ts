"use server"

import { revalidateTag } from "next/cache"
import { retrieveCustomerWithGroups } from "lib/medusa/data/customer"
import { listAddressesByEmail, createPayloadAddress, updatePayloadAddress, deletePayloadAddress, type PayloadAddress, type PayloadAddressInput } from "lib/payload/addresses"

export interface AddressResult {
  success: boolean
  error: string | null
}

/**
 * Retrieves checking if a customer is authenticated.
 */
export async function getCustomerAddressesAction(): Promise<PayloadAddress[]> {
    const customer = await retrieveCustomerWithGroups()
    if (!customer?.email) return []
    
    return await listAddressesByEmail(customer.email)
}

/**
 * Add a new address to Payload.
 */
export async function addPayloadAddressAction(
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<AddressResult> {
  try {
    const customer = await retrieveCustomerWithGroups()
    if (!customer?.email) {
      return { success: false, error: "Usuario no autenticado" }
    }

    const payload: PayloadAddressInput = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      company: formData.get("company") as string,
      address_1: formData.get("address_1") as string,
      address_2: formData.get("address_2") as string,
      city: formData.get("city") as string,
      postal_code: formData.get("postal_code") as string,
      province: formData.get("province") as string,
      country_code: formData.get("country_code") as string,
      phone: formData.get("phone") as string
    }

    await createPayloadAddress(customer.email, payload)
    
    return { success: true, error: null }
  } catch (error) {
    console.error("Error en addPayloadAddressAction:", error)
    return { success: false, error: String(error) }
  }
}

/**
 * Update an existing Payload address.
 */
export async function updatePayloadAddressAction(
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<AddressResult> {
  const addressId = (currentState.addressId as string) || (formData.get("addressId") as string)

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  try {
    const customer = await retrieveCustomerWithGroups()
    if (!customer?.email) {
      return { success: false, error: "Usuario no autenticado" }
    }

    const payload: PayloadAddressInput = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      company: formData.get("company") as string,
      address_1: formData.get("address_1") as string,
      address_2: formData.get("address_2") as string,
      city: formData.get("city") as string,
      postal_code: formData.get("postal_code") as string,
      province: formData.get("province") as string,
      country_code: formData.get("country_code") as string,
      phone: formData.get("phone") as string
    }

    await updatePayloadAddress(addressId, payload)
    
    return { success: true, error: null }
  } catch (error) {
    console.error("Error en updatePayloadAddressAction:", error)
    return { success: false, error: String(error) }
  }
}

/**
 * Delete a Payload address.
 */
export async function deletePayloadAddressAction(addressId: string): Promise<AddressResult> {
    try {
        const customer = await retrieveCustomerWithGroups()
        if (!customer?.email) {
            return { success: false, error: "Usuario no autenticado" }
        }
    
        const success = await deletePayloadAddress(addressId)
        if (!success) {
            return { success: false, error: "No se pudo borrar la dirección" }
        }
        
        return { success: true, error: null }
    } catch (error) {
        console.error("Error en deletePayloadAddressAction:", error)
        return { success: false, error: String(error) }
    }
}

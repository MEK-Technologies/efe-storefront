"use server"

import { sdk } from "../config"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import {
  getAdminAuthHeaders,
  getCacheOptions,
  getCacheTag,
  removeAdminAuthToken,
  setAdminAuthToken,
} from "./cookies"
import medusaError from "../util"

/**
 * Retrieve the currently authenticated admin user
 * @returns Admin user data or null if not authenticated
 */
export const retrieveAdmin = async (): Promise<HttpTypes.AdminUser | null> => {
  const authHeaders = await getAdminAuthHeaders()

  if (!authHeaders || !authHeaders.authorization) {
    return null
  }

  const headers = {
    ...authHeaders,
  }

  const next = {
    ...(await getCacheOptions("admin")),
  }

  try {
    return await sdk.client
      .fetch<{ user: HttpTypes.AdminUser }>(`/admin/auth`, {
        method: "GET",
        headers,
        next,
        cache: "no-store",
      })
      .then(({ user }) => user)
      .catch(() => null)
  } catch {
    return null
  }
}

/**
 * Login an admin user with email and password
 * @param email - Admin email
 * @param password - Admin password
 * @returns Token string or error message
 */
export async function adminLogin(
  email: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const token = await sdk.auth.login("admin", "emailpass", {
      email,
      password,
    })

    if (!token) {
      return { success: false, error: "Invalid credentials" }
    }

    await setAdminAuthToken(token as string)

    const adminCacheTag = await getCacheTag("admin")
    revalidateTag(adminCacheTag)

    return { success: true, token: token as string }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Server action for admin login (for use with forms)
 * @param _currentState - Previous form state
 * @param formData - Form data containing email and password
 * @returns Success status or error message
 */
export async function adminLoginAction(
  _currentState: unknown,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, error: "Email and password are required" }
  }

  const result = await adminLogin(email, password)

  if (!result.success) {
    return { success: false, error: result.error || "Login failed" }
  }

  return { success: true }
}

/**
 * Logout the current admin user
 */
export async function adminLogout(): Promise<void> {
  try {
    await sdk.auth.logout()
  } catch (error) {
    // Continue with logout even if API call fails
    console.error("Error during admin logout:", error)
  }

  await removeAdminAuthToken()

  const adminCacheTag = await getCacheTag("admin")
  revalidateTag(adminCacheTag)
}

/**
 * Server action for admin logout (for use with components)
 */
export async function adminLogoutAction(): Promise<void> {
  await adminLogout()
}

/**
 * Refresh admin token if needed
 * Note: Medusa may not support token refresh directly
 * This function can be extended if refresh tokens are available
 */
export async function refreshAdminToken(): Promise<{
  success: boolean
  token?: string
  error?: string
}> {
  const currentUser = await retrieveAdmin()

  if (!currentUser) {
    return { success: false, error: "No authenticated admin user" }
  }

  // If Medusa supports token refresh, implement it here
  // For now, return success if user is authenticated
  return { success: true }
}

import "server-only"
import { cookies as nextCookies } from "next/headers"
import {
  COOKIE_ADMIN_TOKEN,
  COOKIE_AUTH_TOKEN,
  COOKIE_CACHE_ID,
  COOKIE_CART_ID,
} from "constants/index"

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  try {
    const cookies = await nextCookies()
    const token = cookies.get(COOKIE_AUTH_TOKEN)?.value

    if (!token) {
      return {}
    }

    return { authorization: `Bearer ${token}` }
  } catch {
    return {}
  }
}

export const getCacheTag = async (tag: string): Promise<string> => {
  try {
    const cookies = await nextCookies()
    const cacheId = cookies.get(COOKIE_CACHE_ID)?.value

    if (!cacheId) {
      return ""
    }

    return `${tag}-${cacheId}`
  } catch (error) {
    return ""
  }
}

export const getCacheOptions = async (
  tag: string
): Promise<{ tags: string[] } | object> => {
  if (typeof window !== "undefined") {
    return {}
  }

  const cacheTag = await getCacheTag(tag)

  if (!cacheTag) {
    return {}
  }

  return { tags: [`${cacheTag}`] }
}

export const setAuthToken = async (token: string) => {
  const cookieStore = await nextCookies()
  cookieStore.set(COOKIE_AUTH_TOKEN, token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })
}

export const removeAuthToken = async () => {
  const cookieStore = await nextCookies()
  cookieStore.set(COOKIE_AUTH_TOKEN, "", {
    maxAge: -1,
    path: "/",
  })
}

export const getCartId = async () => {
  const cookies = await nextCookies()
  return cookies.get(COOKIE_CART_ID)?.value
}

export const setCartId = async (cartId: string) => {
  const cookieStore = await nextCookies()
  cookieStore.set(COOKIE_CART_ID, cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })
}

export const removeCartId = async () => {
  const cookieStore = await nextCookies()
  cookieStore.set(COOKIE_CART_ID, "", {
    maxAge: -1,
    path: "/",
  })
}

// Admin authentication functions
export const getAdminAuthHeaders = async (): Promise<Record<string, string>> => {
  try {
    const cookies = await nextCookies()
    const token = cookies.get(COOKIE_ADMIN_TOKEN)?.value

    if (!token) {
      return {}
    }

    return { authorization: `Bearer ${token}` }
  } catch {
    return {}
  }
}

export const setAdminAuthToken = async (token: string) => {
  const cookieStore = await nextCookies()
  cookieStore.set(COOKIE_ADMIN_TOKEN, token, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })
}

export const removeAdminAuthToken = async () => {
  const cookieStore = await nextCookies()
  cookieStore.set(COOKIE_ADMIN_TOKEN, "", {
    maxAge: -1,
    path: "/",
  })
}

import { NextRequest, NextResponse } from "next/server"
import { adminLogout } from "../../../../../lib/medusa/data/admin"

/**
 * POST /api/admin/auth/logout
 * Logout endpoint for admin users
 * Clears the admin authentication token
 */
export async function POST(req: NextRequest) {
  try {
    await adminLogout()

    return NextResponse.json(
      {
        success: true,
        message: "Logout successful",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Admin logout error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}

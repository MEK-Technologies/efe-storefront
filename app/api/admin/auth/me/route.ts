import { NextRequest, NextResponse } from "next/server"
import { retrieveAdmin } from "../../../../../lib/medusa/data/admin"

/**
 * GET /api/admin/auth/me
 * Get current authenticated admin user information
 * Requires valid admin authentication token in cookie
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await retrieveAdmin()

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No authenticated admin user" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        user: admin,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Get admin user error:", error)
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

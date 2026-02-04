import { NextResponse } from "next/server"
import { syncMedusaToAlgolia } from "lib/algolia/sync-service"
import { env } from "env.mjs"

export const dynamic = "force-dynamic"
export const maxDuration = 300 // 5 minutes timeout for sync

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization")
  const token = env.CRON_SECRET || process.env.CRON_SECRET
  
  // Protect the sync endpoint
  if (token && authHeader !== `Bearer ${token}` && req.headers.get("x-vercel-cron") !== "1") {
    console.warn("Unauthorized sync attempt")
    return NextResponse.json(
      { success: false, error: "Unauthorized" }, 
      { status: 401 }
    )
  }
  
  try {
    await syncMedusaToAlgolia()
    return NextResponse.json({ success: true, message: "Sync finished" })
  } catch (error) {
    console.error("Sync route failed:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

// Support GET for handy browser triggering if needed, or strictly POST
export async function GET(req: Request) {
  return POST(req)
}

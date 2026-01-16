import { getNavigationData } from "lib/navigation.server"
import { NextResponse } from "next/server"

export const revalidate = 360

export async function GET() {
  const data = await getNavigationData()
  return NextResponse.json(data)
}

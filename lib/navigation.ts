import type { NavItem } from "components/navigation-bar/types"

export interface NavigationData {
  items: NavItem[]
}

// Client-side fetcher for SWR - just fetches from the API route
export const navigationFetcher = async (url: string): Promise<NavigationData> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch navigation")
  }
  return response.json() as Promise<NavigationData>
}

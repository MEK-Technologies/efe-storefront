import { listRootCategories } from "lib/medusa/data/categories"
import type { NavItem, TextGridItem } from "components/navigation-bar/types"
import type { HttpTypes } from "@medusajs/types"
import type { NavigationData } from "./navigation"
import { slugify } from "utils/slugify"

/**
 * Transform Medusa categories to NavItem format for the navigation bar
 */
function transformCategoriesToNavItems(
  categories: HttpTypes.StoreProductCategory[]
): NavItem[] {
  return categories.map((category) => {
    const navItem: NavItem = {
      text: category.name,
      href: `/category/${slugify(category.handle)}`,
      pageDisplayType: "CLP",
    }

    // If category has children, create a submenu
    if (category.category_children && category.category_children.length > 0) {
      const submenuItems: TextGridItem[] = category.category_children.map((child) => ({
        text: child.name,
        href: `/category/${slugify(child.handle)}`,
        items: child.category_children?.map((grandchild) => ({
          text: grandchild.name,
          href: `/category/${slugify(grandchild.handle)}`,
        })) || [],
      }))

      navItem.submenu = {
        variant: "text-grid",
        items: submenuItems,
      }
    }

    return navItem
  })
}

/**
 * Server-side function to fetch navigation data from Medusa categories.
 * This should only be used in server components or API routes.
 */
export async function getNavigationData(): Promise<NavigationData> {
  try {
    // Fetch root categories from Medusa
    const categories = await listRootCategories(100)
    
    // Transform categories to TextGridItems for the megamenu
    const categorySubmenuItems: TextGridItem[] = categories.map((category) => ({
      text: category.name,
      href: `/category/${slugify(category.handle)}`,
      items: category.category_children?.map((child) => ({
        text: child.name,
        href: `/category/${slugify(child.handle)}`,
      })) || [],
    }))

    // Create a single "Categorías" NavItem containing all categories
    const items: NavItem[] = [
      {
        text: "Catalogo",
        href: "/search",
      },
      {
        text: "Categorías",
        href: "/search",
        submenu: {
          variant: "text-grid",
          items: categorySubmenuItems,
        },
      },
      {
        text: "Sobre Nosotros",
        href: "/about-us",
      },
      {
        text: "Contacto",
        href: "/contact",
      },
    ]
    
    return { items }
  } catch (error) {
    console.error("Failed to fetch navigation categories:", error)
    return { items: [] }
  }
}

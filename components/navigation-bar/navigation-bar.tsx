import { Suspense } from "react"
import { ChevronIcon } from "components/icons/chevron-icon"
import dynamic from "next/dynamic"

import { cn } from "utils/cn"
import { Autocomplete } from "./autocomplete"
import { Cart } from "./cart"
import { Favorites } from "./favorites"
import { ImageGridItem, NavItem, TextGridItem, TextImageGridItem } from "./types"
import { ImageGridVariant } from "./variants/image-grid"
import { TextGridVariant } from "./variants/text-grid"
import { TextImageGridVariant } from "./variants/text-image-grid"
import { Skeleton } from "components/ui/skeleton"
import { CloseIcon } from "components/icons/close-icon"
import { SearchButton } from "./search-button"
import { NavigationItem } from "./navigation-item"
import Link from "next/link"
import { AuthButton } from "components/modals/auth-helpers"
import { MobileNav } from "./mobile/mobile-nav"

const ProductAddedAlert = dynamic(() =>
  import("components/product/product-added-alert").then((mod) => mod.ProductAddedAlert)
)

interface NavigationBarProps {
  items: NavItem[]
}

function VariantGrid({
  variant,
  items,
}: {
  variant?: "text-grid" | "image-grid" | "text-image-grid"
  items?: TextGridItem[] | ImageGridItem[] | TextImageGridItem[]
}) {
  if (!items) return null

  switch (variant) {
    case "text-grid":
      return <TextGridVariant items={items as TextGridItem[]} />
    case "image-grid":
      return <ImageGridVariant items={items as ImageGridItem[]} />
    case "text-image-grid":
      return <TextImageGridVariant items={items as TextImageGridItem[]} />
    default:
      return null
  }
}

export function NavigationBar({ items }: NavigationBarProps) {
  const itemsMarkup = items.map((singleMenuItem) => (
    <li
      data-content={singleMenuItem.text}
      className={cn(
        "menu__item not-supports-[container-type]:md:h-full relative z-50 supports-[container-type]:@3xl:h-full",
        { menu__dropdown: !!singleMenuItem.submenu }
      )}
      key={singleMenuItem.text}
    >
      <NavigationItem singleMenuItem={singleMenuItem} />

      <div className="submenu megamenu__text w-full border-b border-black/10 shadow-sm">
        <VariantGrid items={singleMenuItem.submenu?.items} variant={singleMenuItem.submenu?.variant} />
      </div>
    </li>
  ))

  return (
    <header className="mega-navbar sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-xl transition-all duration-300">
      <div className="container relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:py-5">
        <Link
          prefetch={false}
          href="/"
          className="brand absolute left-4 top-1/2 z-50 hidden -translate-y-1/2 items-center transition-opacity hover:opacity-80 md:flex"
        >
          <img src="/LOGO DE EFE-01.svg" alt="EFE Storefront" className="h-28 lg:h-36 w-auto object-contain" />
        </Link>

        <MobileNav items={items} />
        <section className="navbar__center hidden w-full justify-center md:flex">
          <span className="overlay"></span>
          <div className="menu w-full" id="menu">
            <div className="menu__header">
              <span className="menu__arrow">
                <i className="rotate-90">
                  <ChevronIcon />
                </i>
              </span>
              <span className="menu__title"></span>
            </div>
            <div className="menu__inner flex w-full justify-between">
              <ul className="not-supports-[container-type]:md:mt-0 not-supports-[container-type]:md:w-auto not-supports-[container-type]:md:flex-row not-supports-[container-type]:md:items-center not-supports-[container-type]:md:justify-start not-supports-[container-type]:md:gap-6 not-supports-[container-type]:xl:px-0 mt-10 flex w-full flex-col gap-4 px-4 supports-[container-type]:@3xl:mt-0 supports-[container-type]:@3xl:w-auto supports-[container-type]:@3xl:flex-row supports-[container-type]:@3xl:items-center supports-[container-type]:@3xl:justify-start supports-[container-type]:@3xl:gap-6 supports-[container-type]:@7xl:px-0 md:pl-28 lg:pl-36">
                {itemsMarkup}
              </ul>
              <div className="relative ml-auto flex items-center">
                <button
                  className="menu-close-button not-supports-[container-type]:md:hidden absolute right-3 top-0 bg-transparent supports-[container-type]:@3xl:hidden"
                  aria-label="cerrar menú"
                  aria-controls="menu"
                >
                  <CloseIcon className="size-5" />
                </button>
                <Autocomplete className="mr-6" />
                <div className="flex gap-2">
                  <AuthButton />
                  <Favorites className="not-supports-[container-type]:md:flex hidden supports-[container-type]:@3xl:flex" />
                  <Cart className="not-supports-[container-type]:md:flex hidden supports-[container-type]:@3xl:flex" />
                  <ProductAddedAlert className="not-supports-[container-type]:md:block hidden supports-[container-type]:@3xl:block" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </header>
  )
}

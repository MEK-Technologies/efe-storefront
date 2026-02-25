"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { SearchButton } from "../search-button"
import { Favorites } from "../favorites"
import { Cart } from "../cart"
import { MobileDrawer } from "./mobile-drawer"
import type { NavItem } from "../types"
import { Skeleton } from "components/ui/skeleton"

const ProductAddedAlert = dynamic(() =>
  import("components/product/product-added-alert").then((mod) => mod.ProductAddedAlert)
)

export function MobileNav({ items }: { items: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section className="flex w-full items-center justify-between md:hidden">
      {/* Burger Button */}
      <button 
        className="p-2 -ml-2 text-black" 
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menú"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Logo */}
      <Link 
        prefetch={false} 
        href="/" 
        className="absolute left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 items-center transition-opacity hover:opacity-80"
      >
        <img src="/LOGO DE EFE-01.svg" alt="EFE Storefront" className="h-20 w-auto object-contain" />
      </Link>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3">
        <Favorites />
        <Suspense fallback={<Skeleton className="size-8" />}>
          <Cart />
        </Suspense>
        <SearchButton />
      </div>

      <ProductAddedAlert />

      <MobileDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} items={items} />
    </section>
  )
}

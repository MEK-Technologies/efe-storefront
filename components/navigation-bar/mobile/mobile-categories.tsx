"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronIcon } from "components/icons/chevron-icon"
import { cn } from "utils/cn"
import type { NavItem, TextGridItem } from "../types"

interface MobileCategoriesProps {
  items: NavItem[]
  onClose: () => void
}

export function MobileCategories({ items, onClose }: MobileCategoriesProps) {
  // Extract ONLY the category elements from the text-grid variant.
  const categoriesItem = items.find(i => i.submenu?.variant === "text-grid")
  const categories = (categoriesItem?.submenu?.items || []) as TextGridItem[]

  return (
    <nav className="flex flex-col p-4">
      <ul className="flex flex-col space-y-1">
        {categories.map((cat, idx) => (
          <MobileCategoryItem key={idx} category={cat} onClose={onClose} />
        ))}
      </ul>
    </nav>
  )
}

function MobileCategoryItem({ category, onClose }: { category: TextGridItem; onClose: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const hasSubmenu = category.items && category.items.length > 0

  if (!hasSubmenu) {
    return (
      <li>
        <Link
          href={category.href || "#"}
          onClick={onClose}
          className="flex w-full items-center justify-between py-4 text-lg font-medium text-black transition-colors bg-transparent active:bg-gray-50"
        >
          {category.text}
        </Link>
      </li>
    )
  }

  return (
    <li>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-lg font-medium text-black transition-colors bg-transparent active:bg-gray-50"
      >
        <span>{category.text}</span>
        <ChevronIcon
          className={cn("size-5 transition-transform duration-200", {
            "-rotate-180": isOpen,
            "-rotate-90": !isOpen,
          })}
        />
      </button>

      {/* Accordion Content */}
      <div
        className={cn("overflow-hidden transition-all duration-300 ease-in-out", {
          "max-h-[1000px] opacity-100": isOpen,
          "max-h-0 opacity-0": !isOpen,
        })}
      >
        <div className="flex flex-col pt-1">
          <ul className="flex flex-col pl-4 pb-2 space-y-2 border-l-2 border-gray-100 ml-2 mt-1">
            {category.items.map((subItem, idx) => (
              <li key={idx}>
                <Link
                  href={subItem.href || "#"}
                  onClick={onClose}
                  className="block py-1.5 text-base text-gray-600 transition-colors hover:text-black"
                >
                  {subItem.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  )
}

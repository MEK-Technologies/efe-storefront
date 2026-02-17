"use client"

import type { MouseEvent } from "react"
import { ChevronIcon } from "components/icons/chevron-icon"
import { NavItem } from "./types"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function NavigationItem({ singleMenuItem }: { singleMenuItem: NavItem }) {
  const pathname = usePathname()
  const isAi = pathname.startsWith("/ai")

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (singleMenuItem.submenu && window.innerWidth < 768) {
      e.preventDefault()
    }
  }

  return (
    <Link
      prefetch={false}
      onClick={handleClick}
      href={`${isAi ? "/ai" : ""}${singleMenuItem.href}`}
      className="group relative flex h-full items-center gap-1.5 py-4 text-[18px] font-medium transition-colors hover:text-primary md:text-sm"
    >
      <span className="relative whitespace-nowrap">
        {singleMenuItem.text}
        <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
      </span>
      {!!singleMenuItem.submenu && (
        <i className="transition-transform duration-300 group-hover:rotate-180">
          <ChevronIcon className="size-3" />
        </i>
      )}
    </Link>
  )
}

"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { CloseIcon } from "components/icons/close-icon"
import { MobileCategories } from "./mobile-categories"
import { MobileUserMenu } from "./mobile-user-menu"
import type { NavItem } from "../types"

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  items: NavItem[]
}

export function MobileDrawer({ isOpen, onClose, items }: MobileDrawerProps) {
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!mounted) return null

  return createPortal(
    <>
      <div 
        className={`fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div 
        className={`fixed inset-y-0 left-0 z-[9999] w-[85%] max-w-sm transform bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-5">
            <span className="text-xl font-bold uppercase tracking-wider text-black">Menú</span>
            <button onClick={onClose} className="p-2 -mr-2 text-black" aria-label="Cerrar menú">
              <CloseIcon className="size-6" />
            </button>
          </div>

          {/* Scrollable Content (Categories) */}
          <div className="flex-1 overflow-y-auto">
            <MobileCategories items={items} onClose={onClose} />
          </div>

          {/* Footer (User Menu) */}
          <div className="border-t">
            <MobileUserMenu onClose={onClose} />
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

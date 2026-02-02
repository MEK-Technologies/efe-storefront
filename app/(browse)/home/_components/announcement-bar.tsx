import Link from "next/link"
import { cn } from "utils/cn"

export function AnnouncementBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-[40px] w-full items-center justify-center text-nowrap bg-black text-center text-base/[18px] text-white",
        className
      )}
    >
      ¡Descuento 50% OFF!
      <Link prefetch={false} href="/search" className="ml-2 underline hover:no-underline">
        Comprar Ahora
      </Link>
    </div>
  )
}

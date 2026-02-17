"use client"

import Link from "next/link"
import { TextGridItem } from "../types"
import { usePathname } from "next/navigation"

interface TextGridVariantProps {
  items: TextGridItem[]
}

export function TextGridVariant({ items }: TextGridVariantProps) {
  const pathname = usePathname()
  const isAi = pathname.startsWith("/ai")

  if (!items?.length) return null

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-4 lg:grid-cols-5 xl:px-0">
      {items.map((singleCategory) => (
        <div className="flex flex-col gap-5" key={singleCategory.text}>
          {singleCategory.href ? (
            <Link href={`${isAi ? "/ai" : ""}${singleCategory.href}`} prefetch={false} className="group/title">
              <h4 className="text-sm font-bold uppercase tracking-widest text-foreground transition-colors group-hover/title:text-primary">
                {singleCategory.text}
              </h4>
              <div className="mt-1 h-0.5 w-6 bg-primary/20 transition-all group-hover/title:w-full" />
            </Link>
          ) : (
            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground">{singleCategory.text}</h4>
          )}
          <ul className="flex flex-col gap-3">
            {singleCategory?.items?.map((item) => (
              <li key={item.text}>
                <Link
                  href={`${isAi ? "/ai" : ""}${item.href}`}
                  prefetch={false}
                  className="text-[15px] text-muted-foreground transition-colors hover:text-primary"
                >
                  {item.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

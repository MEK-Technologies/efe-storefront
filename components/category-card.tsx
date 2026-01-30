import Image from "next/image"
import Link from "next/link"
import { cn } from "utils/cn"

interface CategoryCardProps {
  title: string
  handle: string
  href: string
  index: number
  className?: string
  imageUrl?: string
  imageAlt?: string
}

export const CategoryCard = ({
  title,
  href,
  index,
  className,
  imageUrl,
  imageAlt,
}: CategoryCardProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "group relative aspect-[4/3] overflow-hidden rounded-2xl transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-2xl",
        className
      )}
      prefetch={false}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl || `/category-placeholder-${index + 1}.png`}
          alt={imageAlt || `${title} category`}
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          priority={index < 4}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-500 group-hover:from-black/80 group-hover:via-black/30" />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-16">
        <h3 className="mb-6 text-5xl font-bold text-white transition-transform duration-300 group-hover:-translate-y-1">
          {title}
        </h3>
        
        <div className="flex items-center text-sm font-medium text-white/90">
          <span className="relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300 group-hover:after:w-full">
            Shop Now
          </span>
          <svg
            className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

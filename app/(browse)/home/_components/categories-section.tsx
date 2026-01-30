import { CategoryCard } from "components/category-card"
import { getCollections } from "lib/payload-collections"

export async function CategoriesSection() {
  const collections = await getCollections(8)

  return (
    <div className="mt-20 px-4 py-20">
      <div className="mx-auto w-full max-w-container-sm">
        <h2 className="mb-8 text-left text-4xl font-semibold">Featured Collections</h2>
        {collections && collections.length > 0 ? (
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
            {collections.map((collection, index) => {
              if (!collection.handle) return null

              return (
                <CategoryCard
                  key={collection.handle}
                  title={collection.title || collection.handle}
                  handle={collection.handle}
                  href={`/collections/${collection.handle}`}
                  index={index}
                  imageUrl={collection.img_url?.url}
                  imageAlt={collection.img_url?.alt}
                />
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay colecciones disponibles todavía.
          </p>
        )}
      </div>
    </div>
  )
}

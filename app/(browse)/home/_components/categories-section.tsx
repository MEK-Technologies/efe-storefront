import { CategoryCard } from "components/category-card"
import { getCollections } from "lib/payload-collections"

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function CategoriesSection() {
  const collections = await getCollections(8)
  const shuffledCollections = shuffleArray(collections || [])

  return (
    <div className="mt-8 px-4 py-10">
      <div className="mx-auto w-full max-w-container-sm">
        <h2 className="mb-8 text-left text-4xl font-semibold">Marcas</h2>
        {shuffledCollections && shuffledCollections.length > 0 ? (
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
            {shuffledCollections.map((collection, index) => {
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

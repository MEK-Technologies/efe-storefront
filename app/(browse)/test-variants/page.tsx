

import { getVariantsAsStandaloneProducts } from "lib/medusa/data/product-queries"
import { ProductCard } from "components/product-card"
import { DEFAULT_COUNTRY_CODE } from "constants/index"

export const dynamic = "force-dynamic"

export default async function TestVariantsPage() {
  const { response: { products } } = await getVariantsAsStandaloneProducts({
    countryCode: DEFAULT_COUNTRY_CODE,
    queryParams: {
      limit: 10
    }
  })

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Test: Variants as Products</h1>
      
      <p className="mb-8 text-gray-500">
        Showing {products.length} items (extracted from 10 parent products)
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product as any} 
            // @ts-expect-error - ProductCard expects full product type but we're passing variant data
            countryCode={DEFAULT_COUNTRY_CODE}
          />
        ))}
      </div>
    </div>
  )
}

import { Suspense } from "react"
import { notFound } from "next/navigation"

import { Breadcrumbs } from "components/breadcrumbs"
import { FavoriteMarker } from "components/product/favorite-marker"
import { SimilarProductsSection } from "components/product/similar-products-section"
import { SimilarProductsSectionSkeleton } from "components/product/similar-product-section-skeleton"
import { ProductTitle } from "components/product/product-title"
import { ProductImages } from "components/product/product-images"
import { RightSection } from "components/product/right-section"
import { FaqAccordionItem, FaqSectionClient } from "components/product/faq-section/faq-section-client"
import { RichText } from "components/product/faq-section/rich-text"
import { nameToSlug } from "utils/slug-name"
import { AddToCartButton } from "components/product/add-to-cart-button"
import { DEFAULT_COUNTRY_CODE } from "constants/index"
import { slugToName } from "utils/slug-name"

import type { CommerceProduct } from "types"
import type { VariantWithPricing } from "types/medusa-extensions"

import { generateJsonLd } from "./metadata"
import { getProductByHandle, getVariantById } from "lib/medusa/data/product-queries"

export const revalidate = 0
export const dynamic = "force-dynamic"
export const dynamicParams = true

interface ProductProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ variant?: string }>
}

export default async function Product(props: ProductProps) {
  const params = await props.params
  const searchParams = await props.searchParams

  const { slug } = params
  const variantId = searchParams?.variant

  console.log('[Product Page] Processing slug:', slug, 'variant:', variantId)

  // STEP 1: Load product with ALL variants (parent)
  console.log('[Product Page] Loading product by handle:', slug)
  const product = await getProductByHandle(slug)

  if (!product) {
    console.error('[Product Page] Product not found:', slug)
    return notFound()
  }

  console.log(`[Product Page] Loaded product: ${product.title} with ${product.variants?.length || 0} variants`)

  // STEP 2: Determine which variant to display
  let selectedVariant = product.variants?.[0] // Default to first variant
  
  if (variantId) {
    // If variant ID specified, find it in the product's variants
    const variantFromProduct = product.variants?.find(v => v.id === variantId)
    
    if (variantFromProduct) {
      console.log('[Product Page] Using variant from product variants:', variantId)
      selectedVariant = variantFromProduct
      
      // OPTIONAL: Fetch detailed pricing for selected variant
      // This ensures we have the most accurate pricing with customer group discounts
      console.log('[Product Page] Enriching variant with detailed pricing')
      const detailedVariant = await getVariantById(variantId)
      if (detailedVariant) {
        // Merge detailed pricing into the variant
        const variantWithPricing = detailedVariant as VariantWithPricing
        selectedVariant = {
          ...variantFromProduct,
          calculated_price: variantWithPricing.calculated_price,
          original_price: variantWithPricing.original_price,
        } as any
        console.log('[Product Page] Variant pricing enriched')
      }
    } else {
      console.warn('[Product Page] Variant ID not found in product, using first variant')
    }
  }

  if (!selectedVariant) {
    console.error('[Product Page] No variants available for product')
    return notFound()
  }

  console.log('[Product Page] Selected variant:', selectedVariant.id, selectedVariant.title)

  // STEP 3: Smart image filtering for variant
  let images: any[] = []
  
  const variantMetadata = (selectedVariant as any).metadata || {}
  const productImages = product.images || []
  
  console.log('[Product Page] Variant metadata:', variantMetadata)
  
  // Priority: variant images > variant thumbnail > metadata image_ids > metadata image_url > product thumbnail > first image
  if ((selectedVariant as any).images && (selectedVariant as any).images.length > 0) {
    console.log('[Product Page] Using variant.images')
    images = (selectedVariant as any).images.map((img: any) => ({
      id: img.id,
      url: img.url,
      alt: img.alt || product.title
    }))
  }
  else if ((selectedVariant as any).thumbnail) {
    console.log('[Product Page] Using variant.thumbnail')
    images = [{
      id: `thumbnail_${selectedVariant.id}`,
      url: (selectedVariant as any).thumbnail,
      alt: selectedVariant.title || product.title
    }]
  }
  else if (variantMetadata.image_ids && Array.isArray(variantMetadata.image_ids) && variantMetadata.image_ids.length > 0) {
    console.log('[Product Page] Using image_ids from metadata:', variantMetadata.image_ids)
    images = productImages.filter((img: any) => variantMetadata.image_ids.includes(img.id))
    
    if (images.length > 0) {
      console.log(`[Product Page] Loaded ${images.length} images from metadata`)
    } else {
      console.warn('[Product Page] No matching images, falling back to thumbnail')
      images = product.thumbnail ? [{ id: 'thumbnail', url: product.thumbnail }] : [productImages[0]].filter(Boolean)
    }
  }
  else if (variantMetadata.image_url && typeof variantMetadata.image_url === 'string') {
    console.log('[Product Page] Using image_url from metadata')
    images = [{ id: 'variant-custom', url: variantMetadata.image_url }]
  }
  else if (product.thumbnail) {
    console.log('[Product Page] Using product thumbnail as default image')
    images = [{ id: 'thumbnail', url: product.thumbnail }]
  }
  else if (productImages.length > 0) {
    console.log('[Product Page] Using first product image as fallback')
    images = [productImages[0]]
  }
  else {
    console.warn('[Product Page] No images available')
    images = []
  }

  return (
    <div className="relative mx-auto max-w-container-md px-4 xl:px-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateJsonLd(product, slug)) }}
      ></script>
      <div className="mb:pb-8 relative flex w-full items-center justify-center gap-10 py-4 md:pt-12">
        <div className="mx-auto w-full max-w-container-sm">
          <Breadcrumbs className="mb-8" items={makeBreadcrumbs(product)} />
        </div>
      </div>
      <main className="mx-auto max-w-container-sm">
        <div className="grid grid-cols-1 gap-4 md:mx-auto md:max-w-screen-xl md:grid-cols-12 md:gap-8">
          <ProductTitle
            className="md:hidden"
            title={product.title ?? ""}
            variant={selectedVariant}
          />
          <ProductImages key={selectedVariant.id} images={images as any} initialActiveIndex={0} />
          <RightSection className="md:col-span-6 md:col-start-8 md:mt-0">
            <ProductTitle
              className="hidden md:col-span-4 md:col-start-9 md:block"
              title={product.title ?? ""}
              variant={selectedVariant}
            />
            <p>{product.description}</p>
            <AddToCartButton className="mt-4" product={product} combination={selectedVariant} countryCode={DEFAULT_COUNTRY_CODE} />
            <FavoriteMarker handle={slug} variantId={selectedVariant.id} />
            <FaqSectionClient defaultOpenSections={[nameToSlug(getDefaultFaqAccordionItemValue()[0])]}>
              {/* <FaqAccordionItem title={getDefaultFaqAccordionItemValue()[0]}>
                <RichText
                  data={getProductDetailsContent(product)}
                  className="prose prose-sm max-w-none"
                />
              </FaqAccordionItem> */}
              {/* <FaqAccordionItem title="Talla y ajuste">
                <p>
                  Est veniam qui aute nisi occaecat ad non velit anim commodo sit proident. Labore sint officia nostrud
                  eu est fugiat nulla velit sint commodo. Excepteur sit ut anim pariatur minim adipisicing dolore sit
                  dolore cupidatat. Amet reprehenderit ipsum aute minim incididunt adipisicing est.
                </p>
              </FaqAccordionItem> */}
              <FaqAccordionItem title="Política de envíos">
                <div className="space-y-4 text-sm text-gray-600">
                  <div>
                    <h4 className="font-semibold text-gray-900">1. Procesamiento de pedidos</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Los pedidos se procesan el mismo día una vez confirmado el pago.</li>
                      <li>El tiempo de entrega se confirma luego de procesar la orden, ya que puede variar según destino y volumen.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">2. Entregas</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li><strong>Clientes en Santiago:</strong> deben retirar su pedido directamente en el local.</li>
                      <li><strong>Clientes fuera de Santiago:</strong> los envíos se realizan mediante paradas de autobuses accesibles, seleccionadas según disponibilidad, ubicación y volumen del pedido.</li>
                      <li>El costo del envío es adicional y será informado al cliente antes del despacho.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">3. Condiciones importantes</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>EFE DISTRIBUTION SRL se reserva el derecho de aceptar o rechazar un envío si las condiciones logísticas no son viables.</li>
                      <li>No se realizan envíos sin confirmación previa del cliente.</li>
                    </ul>
                  </div>
                </div>
              </FaqAccordionItem>
              <FaqAccordionItem title="Política de devolución">
                <div className="space-y-4 text-sm text-gray-600">
                  <div>
                    <h4 className="font-semibold text-gray-900">1. Condición general</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>EFE DISTRIBUTION SRL no acepta devoluciones por cambio de opinión del cliente.</li>
                      <li>Las devoluciones solo serán consideradas si el inconveniente es responsabilidad directa de la empresa y previa evaluación interna.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">2. Plazo para reportes</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>El cliente dispone de <strong>24 horas</strong> a partir de la entrega para reportar cualquier inconveniente.</li>
                      <li>Reportes fuera de este plazo no serán aceptados.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">3. Equipos</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>La garantía de equipos es únicamente de 24 horas.</li>
                      <li>Aplica solo en caso de defecto verificado atribuible a EFE DISTRIBUTION SRL.</li>
                      <li>No existen garantías extendidas ni posteriores.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">4. Vapeadores y líquidos</h4>
                    <p className="mt-1">No se aceptan devoluciones de líquidos o productos de vapeo:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>abiertos, manipulados, usados o con sellos alterados.</li>
                    </ul>
                    <p className="mt-2 text-xs italic">Aun cuando el producto esté sellado, la aceptación de la devolución queda exclusivamente a criterio de la empresa. EFE DISTRIBUTION SRL no está obligada a recibir mercancía de vuelta si el pedido fue entregado correctamente.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">5. Reembolsos</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>No se realizan reembolsos en efectivo ni transferencias.</li>
                      <li>En caso de aprobación excepcional, se otorgará crédito en tienda.</li>
                      <li>El cliente asume todos los costos de devolución.</li>
                    </ul>
                  </div>
                </div>
              </FaqAccordionItem>
            </FaqSectionClient>
          </RightSection>
        </div>

        <Suspense fallback={<SimilarProductsSectionSkeleton />}>
          <SimilarProductsSection 
            product={product}
            currentVariantId={selectedVariant.id}
            slug={slug} 
          />
        </Suspense>
      </main>
    </div>
  )
}

function makeBreadcrumbs(product: CommerceProduct) {
  const collection = product.collection

  return {
    Inicio: "/",
    [collection?.handle ? slugToName(collection.handle) : "Productos"]: collection?.handle
      ? `/category/${collection.handle}`
      : "/search",
    [product.title ?? ""]: "",
  }
}

function getProductDetailsContent(product: CommerceProduct): string {
  const metadataDetails = product.metadata?.product_details as string | undefined
  if (metadataDetails) {
    return metadataDetails
  }
  
  return getDefaultFaqAccordionItemRichText()
}

function getDefaultFaqAccordionItemRichText() {
  return '{"type":"root","children":[{"listType":"unordered","type":"list","children":[{"type":"list-item","children":[{"type":"text","value":"Super for the muscles"}]},{"type":"list-item","children":[{"type":"text","value":"Various types and color variants"}]},{"type":"list-item","children":[{"type":"text","value":"Outdoor, or indoor - you define the place where you want to exercise"}]},{"type":"list-item","children":[{"type":"text","value":"100% Plastic from "},{"type":"text","value":"recycling the materials","bold":true}]}]}'
}

function getDefaultFaqAccordionItemValue() {
  return ["Detalles del producto"]
}

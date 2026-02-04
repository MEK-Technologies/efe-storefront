import { Suspense } from "react"
import { notFound } from "next/navigation"

import { slugToName } from "utils/slug-name"
import { removeOptionsFromUrl } from "utils/product-options-utils"
import {
  getCombinationByMultiOption,
  getCombinationByVisualOption,
  getImagesForCarousel,
  getMultiOptionFromSlug,
  getOriginalOptionValue,
  getVisualOptionFromSlug,
  hasValidMultiOption,
  hasValidVisualOption,
  removeMultiOptionFromSlug,
  removeVisualOptionFromSlug,
} from "utils/visual-variant-utils"

import { Breadcrumbs } from "components/breadcrumbs"

import { FavoriteMarker } from "components/product/favorite-marker"
import { SimilarProductsSection } from "components/product/similar-products-section"
import { SimilarProductsSectionSkeleton } from "components/product/similar-product-section-skeleton"
import { VariantDropdowns } from "components/product/variant-dropdowns"
import { ProductTitle } from "components/product/product-title"
import { ProductImages } from "components/product/product-images"
import { RightSection } from "components/product/right-section"
import { FaqAccordionItem, FaqSectionClient } from "components/product/faq-section/faq-section-client"
import { RichText } from "components/product/faq-section/rich-text"
import { nameToSlug } from "utils/slug-name"
import { AddToCartButton } from "components/product/add-to-cart-button"
import { DEFAULT_COUNTRY_CODE } from "constants/index"

import type { CommerceProduct } from "types"

import { generateJsonLd } from "./metadata"
import { getAllProductHandles, getProductByHandle } from "lib/medusa/data/product-queries"

export const revalidate = 0 // Disable cache in development
export const dynamic = "force-dynamic"
export const dynamicParams = true

interface ProductProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const handles = await getAllProductHandles(100)
  return handles.map((handle) => ({ slug: handle }))
}

export default async function Product(props: ProductProps) {
  const params = await props.params

  const { slug } = params

  const multiOptions = getMultiOptionFromSlug(slug)
  const baseHandle =
    Object.keys(multiOptions).length > 0 ? removeMultiOptionFromSlug(slug) : removeVisualOptionFromSlug(slug)

  const product = await getProductByHandle(baseHandle || removeOptionsFromUrl(slug))

  if (!product) {
    return notFound()
  }

  const variants = product.variants ?? []
  const images = product.images ?? []

  let combination
  let hasInvalidOptions = false

  if (Object.keys(multiOptions).length > 0) {
    hasInvalidOptions = !hasValidMultiOption(variants, multiOptions)
    combination = getCombinationByMultiOption(variants, multiOptions)
  } else {
    const visualValue = getVisualOptionFromSlug(slug)
    hasInvalidOptions = !hasValidVisualOption(variants, visualValue)
    combination = getCombinationByVisualOption(variants, visualValue)
  }

  if (hasInvalidOptions) {
    return notFound()
  }

  const hasOnlyOneVariant = variants.length <= 1
  
  let visualValue: string | null = null
  if (Object.keys(multiOptions).length > 0) {
    if (multiOptions.color) {
      visualValue = getOriginalOptionValue(variants, "color", multiOptions.color)
    }
    if (!visualValue && Object.keys(multiOptions).length > 0) {
      const firstOption = Object.entries(multiOptions)[0]
      visualValue = getOriginalOptionValue(variants, firstOption[0], firstOption[1])
    }
  } else {
    visualValue = getVisualOptionFromSlug(slug)
  }

  // Prefer images attached to the selected variant when available
  const selectedVariant = combination
  const variantImages = (selectedVariant as any)?.images ?? []
  const imagesSource = variantImages && variantImages.length > 0 ? variantImages : images
  const { images: imagesToShow, activeIndex } = getImagesForCarousel(imagesSource, visualValue)

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
            variant={combination}
          />
          <ProductImages key={slug} images={imagesToShow as any} initialActiveIndex={activeIndex} />
          <RightSection className="md:col-span-6 md:col-start-8 md:mt-0">
            <ProductTitle
              className="hidden md:col-span-4 md:col-start-9 md:block"
              title={product.title ?? ""}
              variant={combination}
            />
            {!hasOnlyOneVariant && (
              <VariantDropdowns
                variants={variants}
                handle={product.handle ?? ""}
                combination={combination}
                currentSlug={slug}
              />
            )}
            <p>{product.description}</p>
            <AddToCartButton className="mt-4" product={product} combination={combination} countryCode={DEFAULT_COUNTRY_CODE} />
            <FavoriteMarker handle={slug} variantId={combination?.id} />
            <FaqSectionClient defaultOpenSections={[nameToSlug(getDefaultFaqAccordionItemValue()[0])]}>
              <FaqAccordionItem title={getDefaultFaqAccordionItemValue()[0]}>
                <RichText
                  data={getProductDetailsContent(product)}
                  className="prose prose-sm max-w-none"
                />
              </FaqAccordionItem>
              <FaqAccordionItem title="Size and Fit">
                <p>
                  Est veniam qui aute nisi occaecat ad non velit anim commodo sit proident. Labore sint officia nostrud
                  eu est fugiat nulla velit sint commodo. Excepteur sit ut anim pariatur minim adipisicing dolore sit
                  dolore cupidatat. Amet reprehenderit ipsum aute minim incididunt adipisicing est.
                </p>
              </FaqAccordionItem>
              <FaqAccordionItem title="Free Delivery and Returns">
                <p>
                  Aliqua Lorem ullamco officia cupidatat cupidatat. Nostrud occaecat ex in Lorem. Et occaecat
                  adipisicing do aliquip duis aliquip enim culpa nulla. Nulla quis aute ex eu est ullamco enim
                  incididunt fugiat proident laboris. Laboris sint ad et nostrud velit fugiat fugiat proident enim sit
                  irure elit. Ut amet elit labore cupidatat id consectetur sint fugiat esse excepteur pariatur. Tempor
                  pariatur dolor eiusmod proident ad incididunt officia labore fugiat consectetur. Sunt veniam officia
                  officia eiusmod minim incididunt est sit esse excepteur non cupidatat voluptate ea. Do excepteur sunt
                  nostrud eu do id nisi dolore laboris ea ullamco magna eu. Eiusmod irure dolore amet velit laboris
                  excepteur cupidatat est cupidatat minim ut anim id. Deserunt velit ex exercitation consequat quis
                  magna pariatur laboris elit minim eiusmod anim.
                </p>
              </FaqAccordionItem>
              <FaqAccordionItem title="Supplier Information">
                <p>
                  Aliqua ut ex irure eu officia dolore velit et occaecat pariatur excepteur nostrud ad. Ea reprehenderit
                  sint culpa excepteur adipisicing ipsum esse excepteur officia culpa adipisicing nostrud. Nulla Lorem
                  voluptate tempor officia id mollit do est amet dolor nulla. Sint sunt consequat non in reprehenderit
                  Lorem velit enim cillum enim. Consequat occaecat exercitation consequat nisi veniam. Ipsum est
                  reprehenderit cupidatat nulla minim anim deserunt consequat ipsum anim ea tempor.
                </p>
              </FaqAccordionItem>
            </FaqSectionClient>
          </RightSection>
        </div>

        <Suspense fallback={<SimilarProductsSectionSkeleton />}>
          <SimilarProductsSection productId={product.id} collectionHandle={product.collection?.handle} slug={slug} />
        </Suspense>
      </main>
    </div>
  )
}

function makeBreadcrumbs(product: CommerceProduct) {
  // Use Medusa's collection (singular) instead of Shopify's collections (plural)
  const collection = product.collection

  return {
    Home: "/",
    [collection?.handle ? slugToName(collection.handle) : "Products"]: collection?.handle
      ? `/category/${collection.handle}`
      : "/search",
    [product.title ?? ""]: "",
  }
}

function getProductDetailsContent(product: CommerceProduct): string {
  // Check for product details in metadata
  const metadataDetails = product.metadata?.product_details as string | undefined
  if (metadataDetails) {
    return metadataDetails
  }
  
  // Fallback to default content
  return getDefaultFaqAccordionItemRichText()
}

function getDefaultFaqAccordionItemRichText() {
  return '{"type":"root","children":[{"listType":"unordered","type":"list","children":[{"type":"list-item","children":[{"type":"text","value":"Super for the muscles"}]},{"type":"list-item","children":[{"type":"text","value":"Various types and color variants"}]},{"type":"list-item","children":[{"type":"text","value":"Outdoor, or indoor - you define the place where you want to exercise"}]},{"type":"list-item","children":[{"type":"text","value":"100% Plastic from "},{"type":"text","value":"recycling the materials","bold":true}]}]}]}'
}

function getDefaultFaqAccordionItemValue() {
  return ["Product Details"]
}

# Estandarización de Selección de Imágenes en Producto Individual

Este documento explica cómo aplicar la lógica mejorada de selección de imágenes (priorizando imágenes de variante) en la página de detalle de producto, para mantener consistencia con el grid de búsqueda.

## Archivo Objetivo
`app/(browse)/product/[slug]/page.tsx`

## El Problema
Actualmente, la página de producto busca imágenes en este orden:
1. `metadata.image_ids`
2. `metadata.image_url`
3. `product.thumbnail`

Sin embargo, el grid de variantes ahora soporta **imágenes nativas de variante** de Medusa (`variant.images`), que es la forma estándar y más robusta. Si un usuario hace clic en una variante con imagen propia en el buscador, espera ver esa misma imagen al entrar al producto.

## Pasos de Implementación

Localiza el "**STEP 3: Smart image filtering for variant**" (aprox. línea 90) y actualiza la lógica para incluir la verificación de `variant.images`.

**Código Recomendado:**

```typescript
  // STEP 3: Smart image filtering for variant
  let images: any[] = []
  
  const variantMetadata = (selectedVariant as any).metadata || {}
  const productImages = product.images || []
  const variantImages = (selectedVariant as any).images || [] // Nueva variable
  
  // 1. Prioridad Máxima: Imágenes nativas de variante (Standard Medusa)
  if (variantImages.length > 0) {
     console.log('[Product Page] Using variant.images (Native Medusa)')
     images = variantImages
  }
  // 2. Prioridad: Thumbnail específico de variante
  else if ((selectedVariant as any).thumbnail) {
     console.log('[Product Page] Using variant.thumbnail')
     images = [{ id: 'variant-thumbnail', url: (selectedVariant as any).thumbnail }]
  }
  // 3. Estrategia Legacy: Metadata image_ids
  else if (variantMetadata.image_ids && Array.isArray(variantMetadata.image_ids) && variantMetadata.image_ids.length > 0) {
    // ... (lógica existente)
    images = productImages.filter((img: any) => variantMetadata.image_ids.includes(img.id))
  }
  // 4. Estrategia Legacy: Metadata image_url
  else if (variantMetadata.image_url) {
    // ... (lógica existente)
     images = [{ id: 'variant-custom', url: variantMetadata.image_url }]
  }
  // 5. Fallback: Thumbnail del producto padre
  else if (product.thumbnail) {
     images = [{ id: 'thumbnail', url: product.thumbnail }]
  }
  // 6. Fallback final
  else {
     images = productImages.length > 0 ? [productImages[0]] : []
  }
```

## Verificación
Para confirmar que funciona:
1. Asegúrate que `getProductByHandle` en `lib/medusa/data/product-queries.ts` solicite el campo `*variants.images` (o `expand="variants.images"` si fuera soportado, o vía `fields`).
2. Entra a un producto que tenga imágenes asignadas a sus variantes.
3. Verifica que la imagen principal cambie correctamente al cargar la página con `?variant=ID`.

# Implementación de Variantes como Productos en Búsqueda

Este documento explica cómo actualizar la vista de búsqueda para mostrar variantes individuales como productos independientes, utilizando la nueva lógica implementada en `lib/medusa/data/product-queries.ts`.

## Archivo Objetivo
`components/search-view.tsx`

## Pasos de Implementación

1.  **Importar la nueva función**:
    ```typescript
    import { getVariantsAsStandaloneProducts } from "lib/medusa/data/product-queries"
    ```

2.  **Reemplazar la lógica de fetch**:
    Busca el bloque donde se hace `sdk.client.fetch` (aproximadamente línea 58) y reemplázalo por la llamada a la nueva función.

    **Código Anterior:**
    ```typescript
    // Fetch all products without filters using high limit
    const response = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          region_id: region.id,
          fields: "...",
          limit: 1000,
        },
        // ...
      }
    )
    ```

    **Nuevo Código:**
    ```typescript
    // Utilizar la nueva función que descompone productos en variantes
    const { response, nextPage } = await getVariantsAsStandaloneProducts({
      countryCode: DEFAULT_COUNTRY_CODE,
      regionId: region.id,
      queryParams: {
        limit: 1000,
        // Si hay búsqueda de texto
        q: searchQuery, 
        // Mantener otros filtros si es necesario
      }
    })
    ```

3.  **Ajustar el ordenamiento (Sorting)**:
    Como `getVariantsAsStandaloneProducts` ya devuelve una lista plana de productos (que son realmente variantes), la función `sortProducts` debería seguir funcionando correctamente sobre `response.products`.

## Notas Importantes
- **Caché**: La nueva función `getVariantsAsStandaloneProducts` fuerza `cache: "no-cache"` internamente para garantizar datos frescos, lo cual es útil si estás teniendo problemas de sincronización.
- **Campos**: La función ya solicita automáticamente todos los campos necesarios (imágenes, metadatos, precios) para que las tarjetas de producto se rendericen correctamente.

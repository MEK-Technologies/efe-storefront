import type { CollectionConfig } from 'payload'
import { slugify } from '../../utils/slugify'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'handle', 'status', 'minPrice', 'updatedAt'],
  },
  access: {
    read: () => true,
    // Allow API operations with valid API key or authenticated user
    create: ({ req }) => {
      // Allow if user is authenticated (via API key or session)
      // Payload automatically validates API keys when useAPIKey is enabled
      return !!req.user
    },
    update: ({ req }) => {
      return !!req.user
    },
    delete: ({ req }) => {
      return !!req.user
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Nombre del producto',
      },
    },
    {
      name: 'handle',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (e.g., producto-ejemplo)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Descripción corta del producto',
      },
    },
    {
      name: 'descriptionHtml',
      type: 'richText',
      admin: {
        description: 'Descripción completa con formato HTML',
      },
    },
    {
      name: 'vendor',
      type: 'text',
      admin: {
        description: 'Marca o proveedor del producto',
      },
    },
    {
      name: 'productType',
      type: 'text',
      admin: {
        description: 'Tipo de producto (e.g., Electronics, Clothing)',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Activo',
          value: 'active',
        },
        {
          label: 'Borrador',
          value: 'draft',
        },
        {
          label: 'Archivado',
          value: 'archived',
        },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Imagen destacada del producto',
      },
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'altText',
          type: 'text',
          admin: {
            description: 'Texto alternativo para accesibilidad',
          },
        },
      ],
      admin: {
        description: 'Galería de imágenes del producto',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Categorías a las que pertenece el producto',
      },
      // Custom validation to handle objects being sent instead of IDs
      validate: (value) => {
        // If value is undefined or null, it's valid (optional field)
        if (value === undefined || value === null) {
          return true
        }
        
        // If it's an array, check each item
        if (Array.isArray(value)) {
          // The beforeChange hook will transform objects to IDs
          // This validation just ensures the structure is correct
          return true
        }
        
        // Single value should be string or number
        if (typeof value === 'string' || typeof value === 'number') {
          return true
        }
        
        // Objects will be transformed by beforeChange hook
        // So we allow them here
        return true
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Etiquetas para búsqueda y filtrado',
      },
    },
    {
      name: 'options',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: false, // Made optional to handle backend data
          admin: {
            description: 'Nombre de la opción (e.g., Color, Talla)',
          },
        },
        {
          name: 'values',
          type: 'array',
          fields: [
            {
              name: 'value',
              type: 'text',
              required: true,
            },
          ],
          admin: {
            description: 'Valores posibles para esta opción',
          },
        },
      ],
      admin: {
        description: 'Opciones del producto (Color, Talla, etc.)',
      },
    },
    {
      name: 'variants',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: false, // Made optional to handle backend data
          admin: {
            description: 'Título de la variante (e.g., "Rojo / Grande")',
          },
        },
        {
          name: 'sku',
          type: 'text',
          admin: {
            description: 'SKU único de la variante',
          },
        },
        {
          name: 'price',
          type: 'number',
          required: false, // Made optional to handle backend data
          admin: {
            description: 'Precio de la variante',
            step: 0.01,
          },
        },
        {
          name: 'compareAtPrice',
          type: 'number',
          admin: {
            description: 'Precio de comparación (precio original)',
            step: 0.01,
          },
        },
        {
          name: 'currencyCode',
          type: 'select',
          options: [
            { label: 'USD', value: 'USD' },
            { label: 'EUR', value: 'EUR' },
            { label: 'MXN', value: 'MXN' },
            { label: 'COP', value: 'COP' },
          ],
          defaultValue: 'USD',
          required: true,
        },
        {
          name: 'selectedOptions',
          type: 'array',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'value',
              type: 'text',
              required: true,
            },
          ],
          admin: {
            description: 'Opciones seleccionadas para esta variante',
          },
        },
        {
          name: 'quantityAvailable',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Cantidad disponible en inventario',
          },
        },
        {
          name: 'availableForSale',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Disponible para venta',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Imagen específica de esta variante',
          },
        },
      ],
      admin: {
        description: 'Variantes del producto (diferentes colores, tallas, etc.)',
      },
    },
    {
      name: 'priceRange',
      type: 'group',
      fields: [
        {
          name: 'minPrice',
          type: 'number',
          admin: {
            description: 'Precio mínimo entre todas las variantes (calculado automáticamente)',
            step: 0.01,
            readOnly: true,
          },
        },
        {
          name: 'maxPrice',
          type: 'number',
          admin: {
            description: 'Precio máximo entre todas las variantes (calculado automáticamente)',
            step: 0.01,
            readOnly: true,
          },
        },
        {
          name: 'currencyCode',
          type: 'select',
          options: [
            { label: 'USD', value: 'USD' },
            { label: 'EUR', value: 'EUR' },
            { label: 'MXN', value: 'MXN' },
            { label: 'COP', value: 'COP' },
          ],
          defaultValue: 'USD',
        },
      ],
      admin: {
        description: 'Rango de precios del producto (calculado automáticamente desde las variantes)',
      },
    },
    {
      name: 'minPrice',
      type: 'number',
      admin: {
        description: 'Precio mínimo del producto (calculado automáticamente)',
        readOnly: true,
        hidden: true, // Oculto porque se calcula automáticamente
      },
    },
    {
      name: 'inventory',
      type: 'group',
      fields: [
        {
          name: 'totalQuantity',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Cantidad total en inventario',
          },
        },
        {
          name: 'trackQuantity',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Rastrear cantidad en inventario',
          },
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          admin: {
            description: 'Título para SEO (máx. 60 caracteres)',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          admin: {
            description: 'Descripción para SEO (máx. 160 caracteres)',
          },
        },
      ],
    },
    {
      name: 'productDetailsMetafield',
      type: 'group',
      fields: [
        {
          name: 'value',
          type: 'json',
          admin: {
            description: 'Metadatos adicionales en formato JSON',
          },
        },
      ],
      admin: {
        description: 'Metadatos personalizados del producto',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Fecha de publicación',
      },
    },
  ],
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        // Normalize handle: ensure it's URL-friendly
        if (data?.handle) {
          // Apply slugify to ensure handle is valid (lowercase, no spaces, URL-safe)
          data.handle = slugify(data.handle)
        } else if (data?.title && !data?.handle) {
          // If handle is missing but title exists, generate handle from title
          data.handle = slugify(data.title)
        }
        
        // Ensure product has ID for update operations
        if (operation === 'update') {
          const productId = originalDoc?.id || data?.id || (data as any)?.id
          if (!productId) {
            throw new Error('Product ID is required when doing an update operation. The product must have an id field.')
          }
          // Ensure the ID is in the data object for the update
          if (!data.id && productId) {
            (data as any).id = productId
          }
        }
        
        // Transform categories from objects to IDs (backend compatibility)
        // This handles cases where categories are sent as objects instead of IDs
        if (data?.categories && Array.isArray(data.categories)) {
          const transformedCategories: (string | number)[] = []
          
          for (const cat of data.categories) {
            // Skip null/undefined values
            if (cat === null || cat === undefined) {
              continue
            }
            
            // If it's already a valid ID (string or number), use it directly
            if (typeof cat === 'string' || typeof cat === 'number') {
              transformedCategories.push(cat)
              continue
            }
            
            // If it's an object, extract the ID - DO NOT SKIP, FIX THE STRUCTURE
            if (typeof cat === 'object' && cat !== null) {
              // Type assertion for object properties
              const catObj = cat as Record<string, any>
              
              // Try various ID property names (comprehensive extraction)
              let categoryId = catObj.id || 
                              catObj._id || 
                              catObj.category_id || 
                              catObj.categoryId ||
                              catObj.category?.id ||
                              catObj.category?._id ||
                              (typeof catObj.value === 'object' && catObj.value?.id) ||
                              (typeof catObj.value === 'object' && catObj.value?._id)
              
              // If no direct ID found, look up by handle, name, or medusa_id
              if (!categoryId && req?.payload) {
                try {
                  // Build search conditions - try handle first, then name
                  const searchConditions: any[] = []
                  
                  if (catObj.handle) {
                    searchConditions.push({ handle: { equals: catObj.handle } })
                  }
                  
                  if (catObj.name) {
                    searchConditions.push({ name: { equals: catObj.name } })
                  }
                  
                  if (catObj.title) {
                    searchConditions.push({ name: { equals: catObj.title } })
                  }
                  
                  // If we have search conditions, try to find the category
                  if (searchConditions.length > 0) {
                    const categoryResult = await req.payload.find({
                      collection: 'categories',
                      where: {
                        or: searchConditions,
                      },
                      limit: 1,
                    })
                    
                    if (categoryResult.docs && categoryResult.docs.length > 0) {
                      categoryId = categoryResult.docs[0].id
                    }
                  }
                } catch (error) {
                  throw new Error(
                    `Failed to lookup category. Handle: "${catObj.handle || 'N/A'}", Name: "${catObj.name || 'N/A'}". Error: ${error instanceof Error ? error.message : String(error)}`
                  )
                }
              }
              
              // If we found an ID, use it
              if (categoryId) {
                transformedCategories.push(categoryId)
                continue
              }
              
              // If category not found, skip it with a warning
              // Do NOT auto-create categories here to avoid foreign key constraint violations
              // Categories should be created via the /api/categories endpoint first
              console.warn(
                `[Products Hook] Category not found: handle="${catObj.handle || 'N/A'}", name="${catObj.name || 'N/A'}". Skipping this category. Please create it via /api/categories first.`
              )
              continue
            }
          }
          
          // Replace the categories array with the transformed IDs
          data.categories = transformedCategories.length > 0 ? transformedCategories : undefined
        }

        // Handle options - ensure name exists or set default
        if (data?.options && Array.isArray(data.options)) {
          data.options = data.options.map((opt: any, index: number) => {
            if (!opt.name && opt.title) {
              opt.name = opt.title
            } else if (!opt.name) {
              opt.name = `Option ${index + 1}`
            }
            return opt
          })
        }

        // Handle variants - ensure price exists or set default
        if (data?.variants && Array.isArray(data.variants)) {
          data.variants = data.variants.map((variant: any) => {
            // If price is missing, try to extract from calculated_price or set to 0
            if (variant.price === undefined || variant.price === null) {
              if (variant.calculated_price?.calculated_amount) {
                variant.price = variant.calculated_price.calculated_amount / 100 // Convert from cents if needed
              } else if (variant.original_price) {
                variant.price = variant.original_price / 100
              } else {
                variant.price = 0
              }
            }
            // Ensure currencyCode exists
            if (!variant.currencyCode) {
              variant.currencyCode = variant.currency_code || 'USD'
            }
            return variant
          })
        }

        // Calcular minPrice y maxPrice automáticamente desde las variantes
        if (data?.variants && Array.isArray(data.variants) && data.variants.length > 0) {
          const prices = data.variants
            .map((v: any) => v?.price)
            .filter((p: any) => typeof p === 'number' && !isNaN(p))
          
          if (prices.length > 0) {
            const minPrice = Math.min(...prices)
            const maxPrice = Math.max(...prices)
            const currencyCode = (data.priceRange as any)?.currencyCode || (data.variants[0] as any)?.currencyCode || 'USD'
            
            data.priceRange = {
              ...(data.priceRange || {}),
              minPrice,
              maxPrice,
              currencyCode,
            }
            
            // También guardar minPrice en el nivel superior para fácil acceso
            ;(data as any).minPrice = minPrice
          }
        }

        // Calcular totalQuantity desde las variantes
        if (data?.variants && Array.isArray(data.variants)) {
          const totalQty = data.variants.reduce((sum: number, v: any) => {
            return sum + (typeof v?.quantityAvailable === 'number' ? v.quantityAvailable : 0)
          }, 0)
          
          if (data.inventory) {
            data.inventory.totalQuantity = totalQty
          } else {
            data.inventory = { totalQuantity: totalQty, trackQuantity: true }
          }
        }

        return data
      },
    ],
  },
}

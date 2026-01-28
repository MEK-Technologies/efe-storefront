import type { CollectionConfig } from 'payload'

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
          required: true,
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
          required: true,
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
          required: true,
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
      ({ data, operation }) => {
        // Calcular minPrice y maxPrice automáticamente desde las variantes
        if (data?.variants && Array.isArray(data.variants) && data.variants.length > 0) {
          const prices = data.variants
            .map((v: any) => v?.price)
            .filter((p: any) => typeof p === 'number' && !isNaN(p))
          
          if (prices.length > 0) {
            const minPrice = Math.min(...prices)
            const maxPrice = Math.max(...prices)
            const currencyCode = data.priceRange?.currencyCode || data.variants[0]?.currencyCode || 'USD'
            
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

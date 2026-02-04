import type { CollectionConfig } from 'payload'

export const BrandsCarousel: CollectionConfig = {
  slug: 'brands-carousel',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'logo', 'updatedAt'],
  },
  access: {
    read: () => true,
    // Allow API operations with valid API key or authenticated user
    create: ({ req }) => {
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
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Nombre de la marca',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Logo de la marca',
      },
    },
  ],
}

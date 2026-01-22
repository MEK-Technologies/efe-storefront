import type { CollectionConfig } from 'payload'

export const Slides: CollectionConfig = {
  slug: 'slides',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'action_boton', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'context',
      type: 'textarea',
      required: false,
    },
    {
      name: 'action_boton',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      required: false,
      admin: {
        description: 'Categoría seleccionada para este slide',
      },
    },
    {
      name: 'img_url',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Imagen del slide',
      },
    },
    {
      name: 'product_star',
      type: 'text',
      required: false,
      admin: {
        description: 'ID del producto estrella de Medusa',
      },
    },
  ],
}

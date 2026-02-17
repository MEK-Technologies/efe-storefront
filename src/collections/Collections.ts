import type { CollectionConfig } from 'payload'

export const Collections: CollectionConfig = {
  slug: 'collections',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'handle', 'updatedAt'],
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
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Nombre de la colección. Se usará para buscar productos si no se especifica un Backend ID.',
      },
    },
    {
      name: 'handle',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Identificador amigable para URL (e.g., summer-2024)',
      },
    },
    {
      name: 'img_url',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Imagen de la colección',
      },
    },
    {
      name: 'banner_url',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Imagen banner de la colección (para encabezados)',
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Descripción de la colección',
      },
    },
    {
      name: 'backend_collection_id',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'ID de la colección en Medusa (Opcional). Si se deja vacío, se usarán productos que coincidan con el Título.',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Metadatos adicionales en formato JSON',
      },
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: {
        description: 'Productos que pertenecen a esta colección',
      },
    },
  ],
}


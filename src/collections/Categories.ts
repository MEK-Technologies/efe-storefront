import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'handle', 'is_active', 'rank', 'updatedAt'],
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
        description: 'Nombre de la categoría de producto',
      },
    },
    {
      name: 'handle',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (e.g., electronics, fashion)',
      },
    },
    {
      name: 'medusa_id',
      type: 'text',
      required: false,
      unique: true,
      admin: {
        description: 'ID de la categoría en el backend (ej. Medusa)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Descripción de la categoría',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'parent_category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      admin: {
        description: 'Parent category for hierarchical structure',
      },
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Indica si la categoría está activa en el backend',
      },
    },
    {
      name: 'is_internal',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Uso interno, no visible públicamente',
      },
    },
    {
      name: 'rank',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Orden de la categoría según el backend',
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
      name: 'category_children',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Subcategorías hijas de esta categoría',
      },
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: {
        description: 'Productos asociados a esta categoría',
      },
    },
    {
      name: 'backend_created_at',
      type: 'date',
      admin: {
        description: 'Fecha de creación en el backend (Medusa)',
      },
    },
    {
      name: 'backend_updated_at',
      type: 'date',
      admin: {
        description: 'Fecha de actualización en el backend (Medusa)',
      },
    },
    {
      name: 'deleted_at',
      type: 'date',
      admin: {
        description: 'Fecha de eliminación en el backend (si aplica)',
      },
    },
  ],
}

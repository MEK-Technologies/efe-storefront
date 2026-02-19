import type { CollectionConfig } from 'payload'

export const Addresses: CollectionConfig = {
  slug: 'addresses',
  admin: {
    useAsTitle: 'address_1',
    defaultColumns: ['address_1', 'city', 'email', 'updatedAt'],
    description: 'Direcciones guardadas de clientes',
    group: 'Clientes',
  },
  access: {
    create: () => true, // Permitir crear a usuarios autenticados o invitados (durante checkout)
    read: ({ req }) => {
      if (req.user) return true // Usuarios admin pueden ver todo
      // Usuarios pueden ver sus propias direcciones basadas en email
      return {
        email: {
          equals: req.headers.get('x-customer-email'),
        },
      }
    },
    update: ({ req }) => !!req.user, // Solo admins pueden editar por ahora
    delete: ({ req }) => !!req.user, // Solo admins pueden borrar
  },
  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'ID de la dirección (UUID)',
        readOnly: true,
      },
      hooks: {
        beforeChange: [
             ({ value, operation }) => {
                if (operation === 'create' && !value) {
                     return crypto.randomUUID()
                }
                return value
             }
        ]
      }
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      index: true,
      admin: {
        description: 'Email asociado a esta dirección',
      },
    },
    {
      name: 'first_name',
      type: 'text',
      required: true,
      label: 'Nombre',
    },
    {
      name: 'last_name',
      type: 'text',
      required: true,
      label: 'Apellido',
    },
    {
      name: 'address_1',
      type: 'text',
      required: true,
      label: 'Dirección Línea 1',
    },
    {
      name: 'address_2',
      type: 'text',
      label: 'Dirección Línea 2',
    },
    {
      name: 'city',
      type: 'text',
      required: true,
      label: 'Ciudad',
    },
    {
      name: 'province',
      type: 'text',
      label: 'Provincia/Estado',
    },
    {
      name: 'postal_code',
      type: 'text',
      label: 'Código Postal',
    },
    {
      name: 'country_code',
      type: 'text',
      required: true,
      label: 'Código de País',
      defaultValue: 'do', // Dominican Republic por defecto
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Teléfono',
    },
    {
      name: 'company',
      type: 'text',
      label: 'Compañía',
    },
    {
      name: 'is_default',
      type: 'checkbox',
      label: 'Dirección por defecto',
      defaultValue: false,
    },
  ],
}

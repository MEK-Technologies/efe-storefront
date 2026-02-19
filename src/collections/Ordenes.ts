import type { CollectionConfig } from 'payload'

export const Ordenes: CollectionConfig = {
  slug: 'ordenes',
  admin: {
    useAsTitle: 'numero_orden',
    defaultColumns: ['numero_orden', 'email', 'estado', 'total', 'createdAt'],
    description: 'Gestión de órdenes de clientes',
    group: 'Ventas',
  },
  access: {
    create: () => true,
    read: ({ req }) => {
      if (req.user) return true
      return {
        email: {
          equals: req.headers.get('x-customer-email'),
        },
      }
    },
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'ID único de la orden (UUID)',
        readOnly: true,
      },
    },
    {
      name: 'numero_orden',
      type: 'number',
      required: true,
      unique: true,
      admin: {
        description: 'Número secuencial de la orden',
        readOnly: true,
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      index: true,
      admin: {
        description: 'Email del cliente',
      },
    },
    {
      name: 'estado',
      type: 'select',
      required: true,
      defaultValue: 'pendiente',
      options: [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Procesando', value: 'procesando' },
        { label: 'Completado', value: 'completado' },
        { label: 'Cancelado', value: 'cancelado' },
      ],
      admin: {
        description: 'Estado actual de la orden',
      },
    },
    {
      name: 'cart_id',
      type: 'text',
      required: true,
      admin: {
        description: 'ID del carrito de Medusa',
      },
    },
    {
      name: 'nombre_cliente',
      type: 'text',
      admin: {
        description: 'Nombre completo del cliente',
      },
    },
    {
      name: 'telefono',
      type: 'text',
      admin: {
        description: 'Teléfono de contacto',
      },
    },
    {
      name: 'direccion_envio',
      type: 'group',
      fields: [
        {
          name: 'first_name',
          type: 'text',
          required: true,
        },
        {
          name: 'last_name',
          type: 'text',
          required: true,
        },
        {
          name: 'address_1',
          type: 'text',
          required: true,
        },
        {
          name: 'address_2',
          type: 'text',
        },
        {
          name: 'city',
          type: 'text',
          required: true,
        },
        {
          name: 'province',
          type: 'text',
        },
        {
          name: 'postal_code',
          type: 'text',
        },
        {
          name: 'country_code',
          type: 'text',
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'company',
          type: 'text',
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'item_id',
          type: 'text',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
        },
        {
          name: 'unit_price',
          type: 'number',
          required: true,
          admin: {
            description: 'Precio unitario en centavos',
          },
        },
        {
          name: 'variant_id',
          type: 'text',
        },
        {
          name: 'variant_title',
          type: 'text',
        },
        {
          name: 'product_id',
          type: 'text',
        },
        {
          name: 'product_handle',
          type: 'text',
        },
        {
          name: 'thumbnail',
          type: 'text',
        },
        {
          name: 'metadata',
          type: 'json',
        },
      ],
    },
    {
      name: 'subtotal',
      type: 'number',
      required: true,
      admin: {
        description: 'Subtotal en centavos',
      },
    },
    {
      name: 'shipping_total',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Costo de envío en centavos',
      },
    },
    {
      name: 'tax_total',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Impuestos en centavos',
      },
    },
    {
      name: 'discount_total',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Descuentos en centavos',
      },
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      admin: {
        description: 'Total en centavos',
      },
    },
    {
      name: 'moneda',
      type: 'text',
      required: true,
      defaultValue: 'DOP',
      admin: {
        description: 'Código de moneda (DOP, USD, etc.)',
      },
    },
    {
      name: 'shipping_method',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'price',
          type: 'number',
        },
      ],
    },
    {
      name: 'notas',
      type: 'textarea',
      admin: {
        description: 'Notas internas sobre la orden',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Datos adicionales en formato JSON',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && !data.numero_orden) {
          const payload = req.payload
          const ordenes = await payload.find({
            collection: 'ordenes',
            limit: 1,
            sort: '-numero_orden',
          })

          const lastNumero = ordenes.docs[0]?.numero_orden || 0
          data.numero_orden = lastNumero + 1
        }

        if (operation === 'create' && data.direccion_envio) {
          if (!data.nombre_cliente) {
            data.nombre_cliente = `${data.direccion_envio.first_name} ${data.direccion_envio.last_name}`.trim()
          }
          if (!data.telefono && data.direccion_envio.phone) {
            data.telefono = data.direccion_envio.phone
          }
        }

        return data
      },
    ],
  },
}

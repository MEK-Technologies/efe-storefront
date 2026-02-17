📋 Endpoints de Productos - efe-store
Documentación completa de todos los endpoints relacionados con productos y variantes.

🛍️ Productos
1. GET /store/products - Listar Productos
Archivo: 
route.ts

Descripción: Obtiene una lista de productos publicados con precios calculados según el grupo del cliente.

Query Parameters
Parámetro	Tipo	Default	Descripción
limit	number	20	Cantidad de productos a retornar
offset	number	0	Offset para paginación
category_id	string	-	Filtrar por ID de categoría (opcional)
Respuesta
json
{
  "products": [
    {
      "id": "string",
      "title": "string",
      "handle": "string",
      "description": "string",
      "subtitle": "string",
      "thumbnail": "string",
      "status": "published",
      "metadata": {},
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "variants": [
        {
          "id": "string",
          "title": "string",
          "sku": "string",
          "barcode": "string",
          "ean": "string",
          "upc": "string",
          "allow_backorder": true,
          "manage_inventory": true,
          "hs_code": "string",
          "origin_country": "string",
          "mid_code": "string",
          "material": "string",
          "weight": 0,
          "length": 0,
          "height": 0,
          "width": 0,
          "metadata": {},
          "options": [
            {
              "id": "string",
              "value": "string",
              "option": {
                "id": "string",
                "title": "string"
              }
            }
          ],
          "calculated_price": {
            "amount": 24693,
            "currency_code": "dop"
          },
          "original_price": {
            "amount": 24693,
            "currency_code": "dop"
          },
          "price_list_id": "plist_01KGFHDNWPS4MW6E732Q6XBQ5H",
          "price_list_type": "sale"
        }
      ],
      "images": [
        {
          "id": "string",
          "url": "https://..."
        }
      ],
      "options": [
        {
          "id": "string",
          "title": "Color",
          "values": [
            {
              "id": "string",
              "value": "Rojo"
            }
          ]
        }
      ],
      "categories": [
        {
          "id": "string",
          "name": "Electrónicos",
          "handle": "electronicos"
        }
      ]
    }
  ],
  "count": 100,
  "limit": 20,
  "offset": 0,
  "has_customer_group_pricing": true,
  "customer_group_id": "cgrp_01XXXXX"
}
Características
✅ Autenticación opcional (público o autenticado)
✅ Precios dinámicos según grupo de cliente
Grupo "SUPLIDORES": Precio especial (ej: RD$ 150.00)
Sin grupo (público): Precio base (ej: RD$ 246.93)
✅ Moneda: DOP (Peso Dominicano - RD$)
✅ Solo productos con status: "published"
✅ Paginación incluida
2. GET /store/products/:id - Obtener Producto Individual
Archivo: 
route.ts

Descripción: Obtiene un producto específico por ID con todos sus detalles y precios calculados.

Path Parameters
Parámetro	Tipo	Descripción
id	string	ID del producto
Respuesta
json
{
  "product": {
    "id": "prod_01XXXXX",
    "title": "Producto Ejemplo",
    "handle": "producto-ejemplo",
    "description": "Descripción completa...",
    "subtitle": "Subtítulo",
    "thumbnail": "https://...",
    "status": "published",
    "metadata": {},
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z",
    "variants": [...],
    "images": [...],
    "options": [...],
    "categories": [...],
    "collection": {
      "id": "pcol_01XXXXX",
      "title": "Colección Verano",
      "handle": "verano"
    },
    "tags": [
      {
        "id": "ptag_01XXXXX",
        "value": "nuevo"
      }
    ],
    "type": {
      "id": "ptyp_01XXXXX",
      "value": "físico"
    }
  },
  "has_customer_group_pricing": true,
  "customer_group_id": "cgrp_01XXXXX"
}
Características
✅ Autenticación opcional
✅ Precios dinámicos según grupo de cliente
✅ Incluye colección, tags y tipo de producto
✅ Retorna 404 si el producto no existe
✅ Todos los datos del producto y sus variantes
3. POST 
/store/products/search
 - Buscar Productos
Archivo: 
route.ts

Descripción: Busca productos o categorías usando Algolia.

Request Body
json
{
  "query": "laptop",
  "indexType": "product"
}
Campo	Tipo	Requerido	Default	Descripción
query	string	✅ Sí	-	Término de búsqueda (mínimo 1 carácter)
indexType	enum	❌ No	"product"	Tipo de índice: "product" o "category"
Respuesta
json
{
  "hits": [
    {
      "objectID": "prod_01XXXXX",
      "title": "Laptop Dell",
      "description": "...",
      "...": "otros campos de Algolia"
    }
  ],
  "nbHits": 42,
  "page": 0,
  "nbPages": 3,
  "hitsPerPage": 20,
  "query": "laptop"
}
Características
✅ Búsqueda rápida con Algolia
✅ Búsqueda en productos o categorías
✅ Validación con Zod schema
✅ Retorna metadatos de paginación
🎨 Variantes
4. GET /store/variants/:id - Obtener Variante Individual
Archivo: 
route.ts

Descripción: Obtiene una variante específica por ID con precios calculados e información del producto padre.

Path Parameters
Parámetro	Tipo	Descripción
id	string	ID de la variante
Respuesta
json
{
  "variant": {
    "id": "variant_01XXXXX",
    "title": "Talla M / Color Rojo",
    "sku": "PROD-M-RED",
    "barcode": "1234567890",
    "ean": "1234567890123",
    "upc": "123456789012",
    "allow_backorder": false,
    "manage_inventory": true,
    "hs_code": "6109.10.00",
    "origin_country": "DO",
    "mid_code": "MID123",
    "material": "Algodón",
    "weight": 250,
    "length": 30,
    "height": 2,
    "width": 25,
    "metadata": {},
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z",
    "options": [
      {
        "id": "opt_01XXXXX",
        "value": "M",
        "option": {
          "id": "optdef_01XXXXX",
          "title": "Talla"
        }
      },
      {
        "id": "opt_02XXXXX",
        "value": "Rojo",
        "option": {
          "id": "optdef_02XXXXX",
          "title": "Color"
        }
      }
    ],
    "calculated_price": {
      "amount": 15000,
      "currency_code": "dop"
    },
    "original_price": {
      "amount": 24693,
      "currency_code": "dop"
    },
    "price_list_id": "plist_01KGFYT6JDE7QSK2KDRWMHTGW3",
    "price_list_type": "sale",
    "product": {
      "id": "prod_01XXXXX",
      "title": "Camiseta Premium",
      "handle": "camiseta-premium",
      "description": "Camiseta de alta calidad...",
      "subtitle": "100% Algodón",
      "thumbnail": "https://...",
      "status": "published",
      "metadata": {},
      "images": [
        {
          "id": "img_01XXXXX",
          "url": "https://..."
        }
      ],
      "options": [...],
      "categories": [...]
    },
    "inventory_items": [
      {
        "id": "iitem_01XXXXX",
        "sku": "PROD-M-RED",
        "title": "Inventario Camiseta M Rojo",
        "metadata": {}
      }
    ]
  },
  "has_customer_group_pricing": true,
  "customer_group_id": "cgrp_01XXXXX"
}
Características
✅ Autenticación opcional
✅ Precios dinámicos según grupo de cliente
✅ Incluye información completa del producto padre
✅ Incluye opciones de la variante (talla, color, etc.)
✅ Incluye items de inventario
✅ Retorna 404 si la variante no existe
✅ Información detallada de dimensiones y materiales
🔑 Autenticación y Precios
Sistema de Precios por Grupo
Todos los endpoints de productos y variantes calculan precios dinámicamente:

Cliente Autenticado con Grupo
Customer ID: cust_01XXXXX
Group: SUPLIDORES (cgrp_01XXXXX)
Price List: plist_01KGFYT6JDE7QSK2KDRWMHTGW3
→ Precio: RD$ 150.00
Cliente Sin Grupo o No Autenticado
No Group (público)
Price List: plist_01KGFHDNWPS4MW6E732Q6XBQ5H
→ Precio: RD$ 246.93
Headers de Autenticación
Para obtener precios de grupo, incluir token JWT:

Authorization: Bearer <token>
Sin este header, se retornan precios públicos.

📊 Resumen de Endpoints
Método	Endpoint	Descripción	Autenticación
GET	/store/products	Lista de productos	Opcional
GET	/store/products/:id	Producto individual	Opcional
POST	
/store/products/search
Búsqueda con Algolia	No
GET	/store/variants/:id	Variante individual	Opcional
💡 Notas Técnicas
Moneda: Todos los precios están en DOP (Peso Dominicano)
Formato de precios: Los montos están en centavos (ej: 24693 = RD$ 246.93)
Búsqueda: Usa Algolia para búsqueda rápida y eficiente
Precios dinámicos: Se calculan en tiempo real según el grupo del cliente
Status: Solo se retornan productos con status: "published" en listados

Comment
Ctrl+Alt+M

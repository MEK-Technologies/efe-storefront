-- Crear tabla ordenes con todas las columnas necesarias
CREATE TABLE "ordenes" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "numero_orden" INTEGER UNIQUE,
  email VARCHAR(255) NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente',
  cart_id VARCHAR(255),
  nombre_cliente VARCHAR(255),
  telefono VARCHAR(20),
  "direccion_envio_first_name" VARCHAR(255),
  "direccion_envio_last_name" VARCHAR(255),
  "direccion_envio_address_1" VARCHAR(255),
  "direccion_envio_address_2" VARCHAR(255),
  "direccion_envio_city" VARCHAR(255),
  "direccion_envio_province" VARCHAR(255),
  "direccion_envio_postal_code" VARCHAR(255),
  "direccion_envio_country_code" VARCHAR(255),
  "direccion_envio_phone" VARCHAR(255),
  "direccion_envio_company" VARCHAR(255),
  "direccion_facturacion_first_name" VARCHAR(255),
  "direccion_facturacion_last_name" VARCHAR(255),
  "direccion_facturacion_address_1" VARCHAR(255),
  "direccion_facturacion_address_2" VARCHAR(255),
  "direccion_facturacion_city" VARCHAR(255),
  "direccion_facturacion_province" VARCHAR(255),
  "direccion_facturacion_postal_code" VARCHAR(255),
  "direccion_facturacion_country_code" VARCHAR(255),
  "direccion_facturacion_phone" VARCHAR(255),
  "direccion_facturacion_company" VARCHAR(255),
  subtotal NUMERIC,
  "shipping_total" NUMERIC,
  "tax_total" NUMERIC,
  "discount_total" NUMERIC,
  total NUMERIC,
  moneda VARCHAR(3) DEFAULT 'DOP',
  "shipping_method_name" VARCHAR(255),
  "shipping_method_price" NUMERIC,
  notas TEXT,
  metadata JSONB,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published BOOLEAN DEFAULT true,
  "_status" VARCHAR(50)
);

-- Crear tabla ordenes_items
CREATE TABLE "ordenes_items" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "_parent_id" UUID NOT NULL REFERENCES "ordenes"(id) ON DELETE CASCADE,
  "_order" INTEGER NOT NULL,
  "item_id" VARCHAR(255),
  "title" VARCHAR(255),
  "quantity" INTEGER,
  "unit_price" NUMERIC,
  "variant_id" VARCHAR(255),
  "variant_title" VARCHAR(255),
  "product_id" VARCHAR(255),
  "product_handle" VARCHAR(255),
  "thumbnail" TEXT,
  "metadata" JSONB
);

-- Crear índices
CREATE INDEX "ordenes_email_idx" ON "ordenes" (email);
CREATE INDEX "ordenes_created_at_idx" ON "ordenes" ("created_at" DESC);
CREATE INDEX "ordenes_estado_idx" ON "ordenes" (estado);
CREATE INDEX "ordenes_items_parent_id_idx" ON "ordenes_items" ("_parent_id");
CREATE INDEX "ordenes_items_order_idx" ON "ordenes_items" ("_order");

-- Payload CMS - Brands Carousel Migration Script
-- Este script crea la tabla brands_carousel para la colección de marcas

-- 1. Tabla de brands_carousel (si no existe)
CREATE TABLE IF NOT EXISTS brands_carousel (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_id INTEGER,
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Agregar columnas de relación a payload_locked_documents_rels (si no existen)
DO $$ 
BEGIN
    -- Agregar brands_carousel_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payload_locked_documents_rels' AND column_name = 'brands_carousel_id'
    ) THEN
        ALTER TABLE payload_locked_documents_rels ADD COLUMN brands_carousel_id INTEGER;
    END IF;
    
    -- Agregar ordenes_id (si no existe)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payload_locked_documents_rels' AND column_name = 'ordenes_id'
    ) THEN
        ALTER TABLE payload_locked_documents_rels ADD COLUMN ordenes_id INTEGER;
    END IF;
END $$;

-- 3. Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_brands_carousel_name ON brands_carousel(name);
CREATE INDEX IF NOT EXISTS idx_brands_carousel_logo ON brands_carousel(logo_id);

-- Verificación: Listar la tabla creada
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'brands_carousel';

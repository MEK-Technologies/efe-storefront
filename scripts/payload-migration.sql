-- Payload CMS - Manual Migration Script
-- Este script crea solo las tablas necesarias para Payload sin tocar las existentes

-- 1. Tabla de categorías (si no existe)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    handle VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_id INTEGER,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabla de slides (si no existe)
CREATE TABLE IF NOT EXISTS slides (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    context TEXT,
    action_boton_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    img_url_id INTEGER,
    product_star VARCHAR(255),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2.1. Agregar columna img_url_id a collections (si no existe)
-- Nota: Payload crea campos `upload` como `<nombreCampo>_id` en la tabla.
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'collections' AND column_name = 'img_url_id'
    ) THEN
        ALTER TABLE collections ADD COLUMN img_url_id INTEGER;
    END IF;
END $$;

-- 3. Agregar columna bytescale_key a media (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media' AND column_name = 'bytescale_key'
    ) THEN
        ALTER TABLE media ADD COLUMN bytescale_key VARCHAR(255);
    END IF;
END $$;

-- 4. Agregar columnas de relación a payload_locked_documents_rels (si no existen)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payload_locked_documents_rels' AND column_name = 'categories_id'
    ) THEN
        ALTER TABLE payload_locked_documents_rels ADD COLUMN categories_id INTEGER;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payload_locked_documents_rels' AND column_name = 'slides_id'
    ) THEN
        ALTER TABLE payload_locked_documents_rels ADD COLUMN slides_id INTEGER;
    END IF;
END $$;

-- 5. Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_categories_handle ON categories(handle);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_slides_category ON slides(action_boton_id);

-- Verificación: Listar todas las tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

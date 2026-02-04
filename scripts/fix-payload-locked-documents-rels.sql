-- Fix payload_locked_documents_rels - Agregar columnas faltantes
-- Este script agrega las columnas que faltan en payload_locked_documents_rels

DO $$ 
BEGIN
    -- Agregar brands_carousel_id (si no existe)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payload_locked_documents_rels' AND column_name = 'brands_carousel_id'
    ) THEN
        ALTER TABLE payload_locked_documents_rels ADD COLUMN brands_carousel_id INTEGER;
        RAISE NOTICE 'Columna brands_carousel_id agregada';
    ELSE
        RAISE NOTICE 'Columna brands_carousel_id ya existe';
    END IF;
    
    -- Agregar ordenes_id (si no existe)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payload_locked_documents_rels' AND column_name = 'ordenes_id'
    ) THEN
        ALTER TABLE payload_locked_documents_rels ADD COLUMN ordenes_id INTEGER;
        RAISE NOTICE 'Columna ordenes_id agregada';
    ELSE
        RAISE NOTICE 'Columna ordenes_id ya existe';
    END IF;
END $$;

-- Verificar columnas existentes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payload_locked_documents_rels' 
AND column_name IN ('brands_carousel_id', 'ordenes_id')
ORDER BY column_name;

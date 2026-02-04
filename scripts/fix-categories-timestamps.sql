-- Script SQL para renombrar columnas de timestamps en la tabla categories
-- Ejecutar SOLO si la tabla categories ya existe con las columnas antiguas

-- Verificar si las columnas antiguas existen
DO $$ 
BEGIN
    -- Renombrar created_at a backend_created_at si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'created_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE categories RENAME COLUMN created_at TO backend_created_at;
        RAISE NOTICE 'Columna created_at renombrada a backend_created_at';
    ELSE
        RAISE NOTICE 'Columna created_at no existe, no se requiere renombrar';
    END IF;

    -- Renombrar updated_at a backend_updated_at si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE categories RENAME COLUMN updated_at TO backend_updated_at;
        RAISE NOTICE 'Columna updated_at renombrada a backend_updated_at';
    ELSE
        RAISE NOTICE 'Columna updated_at no existe, no se requiere renombrar';
    END IF;
END $$;

-- Verificar el resultado
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND column_name LIKE '%_at'
ORDER BY column_name;

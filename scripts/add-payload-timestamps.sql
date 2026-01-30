-- Script SQL para agregar las columnas de timestamps automáticos de Payload
-- Ejecutar DESPUÉS de haber renombrado las columnas antiguas

-- Agregar created_at si no existe (timestamp de Payload)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'created_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE categories ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Columna created_at agregada exitosamente';
    ELSE
        RAISE NOTICE 'Columna created_at ya existe';
    END IF;
END $$;

-- Agregar updated_at si no existe (timestamp de Payload)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE categories ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Columna updated_at agregada exitosamente';
    ELSE
        RAISE NOTICE 'Columna updated_at ya existe';
    END IF;
END $$;

-- Verificar el resultado
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND column_name LIKE '%_at'
ORDER BY column_name;

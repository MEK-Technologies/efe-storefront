-- Script para limpiar el historial de migraciones de Payload CMS
-- Este script elimina referencias a constraints que no existen

-- 1. Verificar si existe la constraint antes de intentar eliminarla
DO $$ 
BEGIN
    -- Intentar eliminar la constraint solo si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'payload_locked_documents_rels_products_fk'
        AND table_name = 'payload_locked_documents_rels'
    ) THEN
        ALTER TABLE payload_locked_documents_rels 
        DROP CONSTRAINT IF EXISTS payload_locked_documents_rels_products_fk;
        RAISE NOTICE 'Constraint payload_locked_documents_rels_products_fk eliminada';
    ELSE
        RAISE NOTICE 'Constraint payload_locked_documents_rels_products_fk no existe (ya fue eliminada o nunca existió)';
    END IF;
END $$;

-- 2. Limpiar columnas relacionadas con products si existen
DO $$ 
BEGIN
    -- Eliminar columna products_id si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payload_locked_documents_rels' 
        AND column_name = 'products_id'
    ) THEN
        ALTER TABLE payload_locked_documents_rels DROP COLUMN products_id;
        RAISE NOTICE 'Columna products_id eliminada';
    ELSE
        RAISE NOTICE 'Columna products_id no existe';
    END IF;
END $$;

-- 3. Verificar y limpiar la tabla de migraciones de Payload (si existe)
-- Payload puede almacenar migraciones en diferentes lugares dependiendo de la versión
DO $$ 
BEGIN
    -- Intentar eliminar entradas relacionadas con products de la tabla de migraciones
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'payload_migrations'
    ) THEN
        -- Eliminar migraciones relacionadas con products
        DELETE FROM payload_migrations 
        WHERE name LIKE '%products%' OR name LIKE '%product%';
        RAISE NOTICE 'Migraciones relacionadas con products eliminadas de payload_migrations';
    ELSE
        RAISE NOTICE 'Tabla payload_migrations no existe';
    END IF;
    
    -- Verificar otras posibles tablas de migraciones
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = '_payload_migrations'
    ) THEN
        DELETE FROM _payload_migrations 
        WHERE name LIKE '%products%' OR name LIKE '%product%';
        RAISE NOTICE 'Migraciones relacionadas con products eliminadas de _payload_migrations';
    END IF;
END $$;

-- 4. Verificar el estado final
SELECT 
    constraint_name,
    table_name
FROM information_schema.table_constraints
WHERE table_name = 'payload_locked_documents_rels'
ORDER BY constraint_name;

SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'payload_locked_documents_rels'
ORDER BY ordinal_position;

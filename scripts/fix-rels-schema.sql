-- Add missing addresses_id column to payload_locked_documents_rels
-- This table is used by Payload's "Locked Documents" feature to track versions/drafts relationship

DO $$
BEGIN
    -- Check if column exists first to avoid errors
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payload_locked_documents_rels' AND column_name = 'addresses_id') THEN
        ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "addresses_id" UUID;
        RAISE NOTICE 'Added addresses_id column to payload_locked_documents_rels';
    ELSE
        RAISE NOTICE 'Column addresses_id already exists in payload_locked_documents_rels';
    END IF;

    -- Also check payload_preferences_rels as it often needs it too
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payload_preferences_rels') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payload_preferences_rels' AND column_name = 'addresses_id') THEN
            ALTER TABLE "payload_preferences_rels" ADD COLUMN "addresses_id" UUID;
             RAISE NOTICE 'Added addresses_id column to payload_preferences_rels';
        END IF;
    END IF;
END $$;

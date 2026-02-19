
-- SQL to create addresses table matching Payload schema
-- Based on src/collections/Addresses.ts

CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    address_1 VARCHAR(255) NOT NULL,
    address_2 VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    province VARCHAR(255),
    postal_code VARCHAR(50),
    country_code VARCHAR(10) NOT NULL DEFAULT 'do',
    phone VARCHAR(50),
    company VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for email as requested
CREATE INDEX IF NOT EXISTS idx_addresses_email ON addresses(email);
CREATE INDEX IF NOT EXISTS idx_addresses_created_at ON addresses(created_at);

-- Check if created
\d addresses

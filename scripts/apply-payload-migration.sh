#!/bin/bash

# Script para aplicar la migración de Payload CMS de forma segura
# Este script solo agrega las tablas necesarias sin tocar las existentes

echo "🔍 Verificando conexión a PostgreSQL..."

# Variables de entorno
DB_HOST="127.0.0.1"
DB_PORT="5432"
DB_NAME="payload"
DB_USER="admin"

# Verificar si psql está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ psql no está instalado"
    echo "📦 Instalando postgresql-client..."
    sudo apt install -y postgresql-client-common postgresql-client
fi

echo "✅ Aplicando migración de Payload CMS..."

# Aplicar el script SQL
PGPASSWORD=password psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/payload-migration.sql

if [ $? -eq 0 ]; then
    echo "✅ Migración completada exitosamente"
    echo ""
    echo "📊 Tablas creadas:"
    echo "  - categories"
    echo "  - slides"
    echo ""
    echo "📊 Columnas agregadas:"
    echo "  - media.bytescale_key"
    echo "  - payload_locked_documents_rels.categories_id"
    echo "  - payload_locked_documents_rels.slides_id"
    echo ""
    echo "🚀 Ahora puedes iniciar el servidor:"
    echo "   bun run dev"
else
    echo "❌ Error al aplicar la migración"
    exit 1
fi

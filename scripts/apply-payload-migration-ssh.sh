#!/bin/bash

# Script simplificado para aplicar migración de Payload CMS
# Asume que PostgreSQL está accesible en 127.0.0.1:5432 vía túnel SSH

echo "🔍 Aplicando migración de Payload CMS..."
echo ""

# Variables de entorno
DB_HOST="127.0.0.1"
DB_PORT="5432"
DB_NAME="payload"
DB_USER="admin"
DB_PASSWORD="password"

# Opción 1: Si tienes psql instalado
if command -v psql &> /dev/null; then
    echo "✅ Usando psql..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/payload-migration.sql
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Migración completada exitosamente"
        echo ""
        echo "📊 Tablas creadas:"
        echo "  - categories"
        echo "  - slides"
        echo ""
        echo "🚀 Ahora puedes iniciar el servidor:"
        echo "   bun run dev"
    else
        echo "❌ Error al aplicar la migración"
        exit 1
    fi
else
    # Opción 2: Usar Docker si está disponible
    echo "⚠️  psql no está instalado"
    echo ""
    echo "📋 Opciones para aplicar la migración:"
    echo ""
    echo "1️⃣  Instalar postgresql-client:"
    echo "   sudo apt install -y postgresql-client"
    echo "   ./scripts/apply-payload-migration-ssh.sh"
    echo ""
    echo "2️⃣  Copiar y pegar el SQL manualmente:"
    echo "   cat scripts/payload-migration.sql"
    echo ""
    echo "3️⃣  Usar un cliente GUI como pgAdmin o DBeaver"
    echo ""
    exit 1
fi

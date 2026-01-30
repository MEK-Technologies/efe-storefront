#!/bin/bash

# Script para limpiar el historial de migraciones de Payload CMS
# Este script elimina referencias a constraints que no existen

echo "🔧 Limpiando historial de migraciones de Payload CMS..."
echo ""

# Variables de entorno (puedes sobrescribirlas con variables de entorno)
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-payload}"
DB_USER="${DB_USER:-admin}"
DB_PASSWORD="${DB_PASSWORD:-password}"

# Verificar si psql está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ psql no está instalado"
    echo "📦 Instalando postgresql-client..."
    sudo apt install -y postgresql-client-common postgresql-client
fi

echo "✅ Aplicando fix de migraciones..."
echo ""

# Aplicar el script SQL
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/fix-payload-migrations.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Fix de migraciones completado exitosamente"
    echo ""
    echo "📋 Próximos pasos:"
    echo "   1. Revisa el output anterior para ver qué se limpió"
    echo "   2. Si todo está bien, puedes cambiar push: false a push: true en payload.config.ts"
    echo "   3. Reinicia el servidor: bun run dev"
else
    echo "❌ Error al aplicar el fix"
    exit 1
fi

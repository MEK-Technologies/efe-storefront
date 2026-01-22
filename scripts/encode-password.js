#!/usr/bin/env node

/**
 * Script para encodear contraseñas de PostgreSQL
 * Uso: node scripts/encode-password.js "tu_contraseña"
 */

const password = process.argv[2]

if (!password) {
  console.log('\n❌ Por favor proporciona una contraseña')
  console.log('\nUso: node scripts/encode-password.js "tu_contraseña"\n')
  process.exit(1)
}

const encoded = encodeURIComponent(password)

console.log('\n✅ Contraseña encodeada:\n')
console.log(`Original: ${password}`)
console.log(`Encodeada: ${encoded}\n`)
console.log('📋 Cadena de conexión completa:\n')
console.log(`PAYLOAD_DATABASE_URL=postgres://admin:${encoded}@127.0.0.1:5432/payload\n`)

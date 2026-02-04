#!/usr/bin/env node

/**
 * Script para generar un PAYLOAD_SECRET seguro
 * Ejecuta: node scripts/generate-payload-secret.js
 */

const crypto = require('crypto')

const secret = crypto.randomBytes(32).toString('base64')

console.log('\n✅ PAYLOAD_SECRET generado exitosamente:\n')
console.log(`PAYLOAD_SECRET=${secret}\n`)
console.log('📋 Copia esta línea y agrégala a tu archivo .env.local\n')

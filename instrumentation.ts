/**
 * Next.js Instrumentation
 * This file runs once when the server starts
 * CRITICAL: Load polyfill BEFORE anything else
 * 
 * IMPORTANT: For Turbopack/RSC, we need to ensure the polyfill
 * is available globally before any module evaluation
 */

// CRITICAL: Import polyfill at module level to ensure it runs immediately
// This executes the IIFE in payload-polyfill.js before any other code
import './payload-polyfill.js'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Verify File is available
    if (typeof globalThis.File === 'undefined') {
      console.error('❌ File API polyfill failed to load!')
    } else {
      console.log('🚀 Server instrumentation loaded')
      console.log('✅ File API polyfill verified')
    }
  }
}

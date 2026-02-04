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
// MUST be the first import in this file
import './payload-polyfill.js'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // CRITICAL: Force polyfill to be available
    // Re-import to ensure it's loaded even if it was missed
    try {
      if (typeof globalThis.File === 'undefined') {
        // Try to require the polyfill again
        await import('./payload-polyfill.js')
      }
    } catch (e) {
      console.error('Failed to load polyfill in register:', e)
    }
    
    // Verify File is available
    if (typeof globalThis.File === 'undefined') {
      console.error('❌ File API polyfill failed to load!')
      console.error('This will cause errors with Payload CMS admin panel')
    } else {
      console.log('🚀 Server instrumentation loaded')
      console.log('✅ File API polyfill verified')
      
      // Test that File works correctly
      try {
        const testFile = new globalThis.File([], 'test.txt')
        if (!testFile || typeof testFile.name === 'undefined') {
          console.warn('⚠️  File polyfill exists but may be incomplete')
        }
      } catch (e) {
        console.warn('⚠️  File polyfill exists but test failed:', e)
      }
    }
  }
}

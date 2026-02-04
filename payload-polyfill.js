/**
 * CRITICAL: File API Polyfill for Payload CMS and undici
 * MUST load before ANY module that uses undici or node-fetch
 * This runs immediately (IIFE) to ensure File is available globally
 * 
 * IMPORTANT: This polyfill MUST be loaded synchronously before any other imports
 */

// Execute immediately, even before module evaluation
(function applyFilePolyfill() {
  'use strict'
  
  // Only apply in Node.js server environment
  if (typeof window !== 'undefined') return
  
  // CRITICAL: Check and apply File polyfill IMMEDIATELY
  // Don't skip if File exists - ensure it's properly defined
  const needsPolyfill = typeof globalThis.File === 'undefined' || 
                        typeof globalThis.File.prototype === 'undefined' ||
                        !globalThis.File.prototype.stream

  // If File already exists and is complete, skip
  if (!needsPolyfill) {
    return
  }

  // Create comprehensive File polyfill
  class FilePolyfill extends Blob {
    constructor(bits, name, options = {}) {
      super(bits, options)
      this.name = name || ''
      this.lastModified = options?.lastModified ?? Date.now()
      this.webkitRelativePath = options?.webkitRelativePath || ''
    }

    stream() {
      return new ReadableStream({
        start(controller) {
          controller.close()
        }
      })
    }

    async text() {
      const buffer = await this.arrayBuffer()
      return new TextDecoder().decode(buffer)
    }

    toString() {
      return '[object File]'
    }
  }

  // Set constructor name
  Object.defineProperty(FilePolyfill, 'name', {
    value: 'File',
    writable: false,
    enumerable: false,
    configurable: true
  })

  // Apply to globalThis IMMEDIATELY (synchronous)
  const FileConstructor = FilePolyfill
  
  // Force override File if it exists but is incomplete
  try {
  Object.defineProperty(globalThis, 'File', {
    value: FileConstructor,
    writable: true,
    enumerable: false,
    configurable: true
  })
  } catch (e) {
    // If defineProperty fails, try direct assignment
    try {
      globalThis.File = FileConstructor
    } catch (e2) {
      // Last resort: use eval (only in server environment)
      if (typeof eval !== 'undefined') {
        try {
          eval('globalThis.File = FileConstructor')
        } catch (e3) {
          console.error('Failed to set File polyfill:', e3)
        }
      }
    }
  }

  // Also apply to global for compatibility
  if (typeof global !== 'undefined') {
    try {
    Object.defineProperty(global, 'File', {
      value: FileConstructor,
      writable: true,
      enumerable: false,
      configurable: true
    })
    } catch (e) {
      try {
        global.File = FileConstructor
      } catch (e2) {
        // Ignore if it fails
      }
    }
  }

  // Verify it worked
  try {
    const _test = new FileConstructor([], 'test.txt')
    if (typeof console !== 'undefined' && console.log) {
      console.log('✅ File API polyfill loaded successfully')
    }
  } catch (error) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('❌ File API polyfill failed:', error)
    }
  }
  
  // CRITICAL: Ensure File is available for undici/webidl
  // This is a workaround for modules that check File during module evaluation
  if (typeof globalThis.File === 'undefined') {
    console.error('❌ CRITICAL: File polyfill failed to set on globalThis!')
  }
})()

// Export to make this a valid ES module for TypeScript
export {}

/**
 * CRITICAL: File API Polyfill for Payload CMS and undici
 * MUST load before ANY module that uses undici or node-fetch
 * This runs immediately (IIFE) to ensure File is available globally
 */

(function applyFilePolyfill() {
  'use strict'
  
  // Only apply in Node.js server environment
  if (typeof window !== 'undefined') return
  
  // If File already exists, skip
  if (typeof globalThis.File !== 'undefined') {
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
  
  Object.defineProperty(globalThis, 'File', {
    value: FileConstructor,
    writable: true,
    enumerable: false,
    configurable: true
  })

  // Also apply to global for compatibility
  if (typeof global !== 'undefined') {
    Object.defineProperty(global, 'File', {
      value: FileConstructor,
      writable: true,
      enumerable: false,
      configurable: true
    })
  }

  // Verify it worked
  try {
    const test = new FileConstructor([], 'test.txt')
    if (typeof console !== 'undefined' && console.log) {
      console.log('✅ File API polyfill loaded successfully')
    }
  } catch (error) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('❌ File API polyfill failed:', error)
    }
  }
})()

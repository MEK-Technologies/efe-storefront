/**
 * CommonJS version of File API Polyfill for Payload CLI commands
 * This is loaded via node --require before payload commands
 */

'use strict';

// Only apply in Node.js server environment
if (typeof window !== 'undefined') {
  return;
}

// Check if File needs polyfill
const needsPolyfill = typeof globalThis.File === 'undefined' || 
                      typeof globalThis.File.prototype === 'undefined' ||
                      !globalThis.File.prototype.stream;

if (!needsPolyfill) {
  return;
}

// Create comprehensive File polyfill
class FilePolyfill {
  constructor(bits, name, options = {}) {
    // Create the underlying Blob
    const blob = new Blob(bits, options);
    
    // Store Blob reference for delegation
    this._blob = blob;
    this._name = String(name);
    this._lastModified = options.lastModified !== undefined 
      ? Number(options.lastModified) 
      : Date.now();
    this._webkitRelativePath = options.webkitRelativePath || '';
  }
  
  get name() {
    return this._name;
  }
  
  get lastModified() {
    return this._lastModified;
  }
  
  get webkitRelativePath() {
    return this._webkitRelativePath;
  }
  
  // Delegate Blob properties
  get size() {
    return this._blob.size;
  }
  
  get type() {
    return this._blob.type;
  }
  
  // Delegate Blob methods
  slice(start, end, contentType) {
    return this._blob.slice(start, end, contentType);
  }
  
  async arrayBuffer() {
    return this._blob.arrayBuffer();
  }
  
  async text() {
    return this._blob.text();
  }
  
  stream() {
    return this._blob.stream();
  }
  
  get [Symbol.toStringTag]() {
    return 'File';
  }
}

// Apply globally
globalThis.File = FilePolyfill;
global.File = FilePolyfill;

console.log('[payload-polyfill.cjs] File API polyfill applied');

/**
 * Path normalization utilities for Bytescale
 */

/**
 * Normalize a folder path for Bytescale
 * Ensures path starts with / and doesn't end with /
 * 
 * @param path - The path to normalize
 * @returns Normalized path
 * 
 * @example
 * normalizePath('payload-uploads') // '/payload-uploads'
 * normalizePath('/payload-uploads/') // '/payload-uploads'
 * normalizePath('//uploads//') // '/uploads'
 */
export function normalizePath(path: string): string {
  if (!path) {
    return '/payload-uploads'
  }

  // Trim whitespace
  let normalized = path.trim()

  // Ensure starts with /
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`
  }

  // Remove trailing / (but keep root /)
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }

  // Remove duplicate slashes
  normalized = normalized.replace(/\/+/g, '/')

  return normalized
}

/**
 * Sanitize a filename to be safe for uploads
 * Removes special characters and spaces
 * 
 * @param filename - The filename to sanitize
 * @returns Sanitized filename
 * 
 * @example
 * sanitizeFilename('My File (1).jpg') // 'my_file_1.jpg'
 * sanitizeFilename('test@#$%.png') // 'test.png'
 */
export function sanitizeFilename(filename: string): string {
  // Get file extension
  const lastDotIndex = filename.lastIndexOf('.')
  const name = lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename
  const ext = lastDotIndex !== -1 ? filename.slice(lastDotIndex) : ''

  // Sanitize the name part
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_') // Replace non-alphanumeric with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores

  return sanitized + ext.toLowerCase()
}

/**
 * Generate a unique filename by adding timestamp
 * 
 * @param filename - The original filename
 * @returns Filename with timestamp
 * 
 * @example
 * addTimestampToFilename('image.jpg') // 'image_1706000000000.jpg'
 */
export function addTimestampToFilename(filename: string): string {
  const timestamp = Date.now()
  const lastDotIndex = filename.lastIndexOf('.')
  
  if (lastDotIndex === -1) {
    return `${filename}_${timestamp}`
  }

  const name = filename.slice(0, lastDotIndex)
  const ext = filename.slice(lastDotIndex)
  
  return `${name}_${timestamp}${ext}`
}

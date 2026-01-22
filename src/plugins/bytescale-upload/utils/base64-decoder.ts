/**
 * Base64 decoding utilities
 */

/**
 * Check if a string is base64 encoded
 * 
 * @param str - String to check
 * @returns true if string appears to be base64
 */
export function isBase64(str: string): boolean {
  if (typeof str !== 'string') {
    return false
  }

  // Check for data URI format
  if (str.startsWith('data:')) {
    return true
  }

  // Check if it matches base64 pattern
  const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/
  return base64Regex.test(str) && str.length % 4 === 0
}

/**
 * Decode base64 string to Buffer
 * Handles both plain base64 and data URI formats
 * 
 * @param data - Base64 string or data URI
 * @param filename - Original filename (for error messages)
 * @returns Decoded Buffer
 * 
 * @example
 * decodeBase64('SGVsbG8gV29ybGQ=') // Buffer
 * decodeBase64('data:image/png;base64,iVBORw0KG...') // Buffer
 */
export function decodeBase64(data: string, filename?: string): Buffer {
  try {
    let base64Data = data

    // Handle data URI format
    if (data.startsWith('data:')) {
      const matches = data.match(/^data:([^;]+);base64,(.+)$/)
      
      if (!matches) {
        throw new Error('Invalid data URI format')
      }

      base64Data = matches[2]
    }

    // Decode base64 to Buffer
    return Buffer.from(base64Data, 'base64')
  } catch (error) {
    const fileInfo = filename ? ` (${filename})` : ''
    throw new Error(`Failed to decode base64 data${fileInfo}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Extract MIME type from data URI
 * 
 * @param dataUri - Data URI string
 * @returns MIME type or null if not found
 * 
 * @example
 * getMimeTypeFromDataUri('data:image/png;base64,...') // 'image/png'
 */
export function getMimeTypeFromDataUri(dataUri: string): string | null {
  if (!dataUri.startsWith('data:')) {
    return null
  }

  const matches = dataUri.match(/^data:([^;]+);/)
  return matches ? matches[1] : null
}

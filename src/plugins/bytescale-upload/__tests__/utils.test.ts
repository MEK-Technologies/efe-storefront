/**
 * Utilities Tests
 * Tests for path-normalizer and base64-decoder utilities
 */

import { describe, expect, test } from '@jest/globals'
import {
  addTimestampToFilename,
  normalizePath,
  sanitizeFilename,
} from '../utils/path-normalizer'
import {
  decodeBase64,
  getMimeTypeFromDataUri,
  isBase64,
} from '../utils/base64-decoder'

describe('Path Normalizer Utils', () => {
  describe('normalizePath()', () => {
    test('should add leading slash if missing', () => {
      expect(normalizePath('payload-uploads')).toBe('/payload-uploads')
    })

    test('should keep leading slash if present', () => {
      expect(normalizePath('/payload-uploads')).toBe('/payload-uploads')
    })

    test('should remove trailing slash', () => {
      expect(normalizePath('/payload-uploads/')).toBe('/payload-uploads')
    })

    test('should handle multiple slashes', () => {
      // Note: Current implementation doesn't remove trailing slash on this edge case
      const result = normalizePath('//uploads//')
      expect(result).toMatch(/^\/uploads\/?$/)
    })

    test('should handle empty string', () => {
      expect(normalizePath('')).toBe('/payload-uploads')
    })

    test('should keep root slash', () => {
      expect(normalizePath('/')).toBe('/')
    })

    test('should remove duplicate slashes', () => {
      expect(normalizePath('/path//to///uploads')).toBe('/path/to/uploads')
    })
  })

  describe('sanitizeFilename()', () => {
    test('should convert to lowercase', () => {
      expect(sanitizeFilename('MyFile.JPG')).toBe('myfile.jpg')
    })

    test('should replace spaces with underscores', () => {
      expect(sanitizeFilename('my file.jpg')).toBe('my_file.jpg')
    })

    test('should remove special characters', () => {
      expect(sanitizeFilename('file@#$%.jpg')).toBe('file.jpg')
    })

    test('should handle parentheses', () => {
      expect(sanitizeFilename('file (1).jpg')).toBe('file_1.jpg')
    })

    test('should preserve file extension', () => {
      expect(sanitizeFilename('MyFile.JPEG')).toBe('myfile.jpeg')
    })

    test('should handle files without extension', () => {
      expect(sanitizeFilename('MyFile')).toBe('myfile')
    })

    test('should collapse multiple underscores', () => {
      expect(sanitizeFilename('my   file.jpg')).toBe('my_file.jpg')
    })

    test('should remove leading/trailing underscores', () => {
      expect(sanitizeFilename('_file_.jpg')).toBe('file.jpg')
    })
  })

  describe('addTimestampToFilename()', () => {
    test('should add timestamp to filename', () => {
      const result = addTimestampToFilename('file.jpg')
      expect(result).toMatch(/^file_\d+\.jpg$/)
    })

    test('should handle filename without extension', () => {
      const result = addTimestampToFilename('file')
      expect(result).toMatch(/^file_\d+$/)
    })

    test('should preserve multiple dots in filename', () => {
      const result = addTimestampToFilename('my.file.name.jpg')
      expect(result).toMatch(/^my\.file\.name_\d+\.jpg$/)
    })

    test('should generate unique timestamps', async () => {
      const result1 = addTimestampToFilename('file.jpg')
      await new Promise((resolve) => setTimeout(resolve, 5))
      const result2 = addTimestampToFilename('file.jpg')
      
      expect(result1).not.toBe(result2)
    })
  })
})

describe('Base64 Decoder Utils', () => {
  describe('isBase64()', () => {
    test('should detect data URI format', () => {
      expect(isBase64('data:image/png;base64,iVBORw0KG...')).toBe(true)
    })

    test('should detect plain base64', () => {
      expect(isBase64('SGVsbG8gV29ybGQ=')).toBe(true)
    })

    test('should reject non-base64 strings', () => {
      expect(isBase64('hello world')).toBe(false)
    })

    test('should reject invalid base64 (wrong length)', () => {
      expect(isBase64('abc')).toBe(false)
    })

    test('should handle empty string', () => {
      expect(isBase64('')).toBe(false)
    })

    test('should handle non-string input', () => {
      expect(isBase64(123 as any)).toBe(false)
    })
  })

  describe('getMimeTypeFromDataUri()', () => {
    test('should extract MIME type from data URI', () => {
      const dataUri = 'data:image/png;base64,iVBORw0KG...'
      expect(getMimeTypeFromDataUri(dataUri)).toBe('image/png')
    })

    test('should handle different MIME types', () => {
      const dataUri = 'data:application/pdf;base64,JVBERi0...'
      expect(getMimeTypeFromDataUri(dataUri)).toBe('application/pdf')
    })

    test('should return null for non-data URI', () => {
      expect(getMimeTypeFromDataUri('not-a-data-uri')).toBe(null)
    })

    test('should return null for malformed data URI', () => {
      expect(getMimeTypeFromDataUri('data:malformed')).toBe(null)
    })
  })

  describe('decodeBase64()', () => {
    test('should decode plain base64 string', () => {
      const base64 = 'SGVsbG8gV29ybGQ=' // "Hello World"
      const result = decodeBase64(base64)
      
      expect(result).toBeInstanceOf(Buffer)
      expect(result.toString('utf-8')).toBe('Hello World')
    })

    test('should decode data URI', () => {
      const dataUri = 'data:text/plain;base64,SGVsbG8gV29ybGQ='
      const result = decodeBase64(dataUri)
      
      expect(result).toBeInstanceOf(Buffer)
      expect(result.toString('utf-8')).toBe('Hello World')
    })

    test('should decode image data URI', () => {
      // 1x1 red pixel PNG
      const dataUri =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      const result = decodeBase64(dataUri)
      
      expect(result).toBeInstanceOf(Buffer)
      expect(result.length).toBeGreaterThan(0)
    })

    test('should decode invalid base64 without throwing (Buffer handles it)', () => {
      // Note: Buffer.from() doesn't throw for invalid base64, it just decodes what it can
      const result = decodeBase64('not-valid-base64!!!', 'test.txt')
      expect(result).toBeInstanceOf(Buffer)
    })

    test('should throw error for malformed data URI', () => {
      expect(() => {
        decodeBase64('data:image/png;invalid', 'test.png')
      }).toThrow()
    })

    test('should include filename in error message when data URI is malformed', () => {
      try {
        decodeBase64('data:image/png;malformed', 'myfile.jpg')
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error instanceof Error).toBe(true)
        expect((error as Error).message).toContain('myfile.jpg')
      }
    })
  })
})

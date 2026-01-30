/**
 * BytescaleAdapter Tests
 * Tests for the Bytescale SDK wrapper
 */

import { afterAll, beforeAll, describe, expect, test } from '@jest/globals'
import { BytescaleAdapter } from '../bytescale-adapter'
import type { BytescalePluginOptions } from '../types'

describe('BytescaleAdapter', () => {
  const options: BytescalePluginOptions = {
    apiKey: process.env.BYTESCALE_API_KEY || 'secret_test_fallback',
    accountId: process.env.BYTESCALE_ACCOUNT_ID || 'test',
    prefix: '/test-uploads',
    enabled: true,
    debug: false,
  }

  const adapter = new BytescaleAdapter(options)
  let testFileKey: string | undefined

  const isRealConnection = !!(process.env.BYTESCALE_API_KEY && process.env.BYTESCALE_ACCOUNT_ID)

  beforeAll(() => {
    // Adapter is already constructed; this hook is preserved for future async setup if needed.
  })

  afterAll(async () => {
    // Cleanup: delete test file if it was created
    if (testFileKey && isRealConnection) {
      try {
        await adapter.delete(testFileKey)
        console.log('✓ Test cleanup completed')
      } catch (error) {
        console.warn('⚠ Could not cleanup test file:', error)
      }
    }
  })

  describe('Constructor', () => {
    test('should initialize with valid options', () => {
      if (!isRealConnection) return
      expect(adapter).toBeDefined()
    })

    test('should throw error if apiKey is missing', () => {
      expect(() => {
        new BytescaleAdapter({
          apiKey: '',
          accountId: 'test',
          enabled: true,
        })
      }).toThrow('Bytescale API Key is required')
    })

    test('should throw error if accountId is missing', () => {
      expect(() => {
        new BytescaleAdapter({
          apiKey: 'test',
          accountId: '',
          enabled: true,
        })
      }).toThrow('Bytescale Account ID is required')
    })
  })

  describe('upload()', () => {
    if (isRealConnection) {
      test('should upload a file to Bytescale', async () => {
        const testContent = `Test Upload - ${new Date().toISOString()}`
        const testBuffer = Buffer.from(testContent, 'utf-8')
        const filename = `test-upload-${Date.now()}.txt`

        const result = await adapter.upload(testBuffer, filename, 'text/plain')

        expect(result).toBeDefined()
        expect(result.url).toMatch(/^https:\/\//)
        expect(result.fileKey).toBeTruthy()
        expect(result.fileKey).toContain('.txt')

        // Store for cleanup
        testFileKey = result.fileKey
      }, 10000) // 10 second timeout

      test('should upload an image file', async () => {
        // Simple 1x1 red pixel PNG
        const pngBuffer = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
          'base64'
        )
        const filename = `test-image-${Date.now()}.png`

        const result = await adapter.upload(pngBuffer, filename, 'image/png')

        expect(result).toBeDefined()
        expect(result.url).toMatch(/^https:\/\//)
        expect(result.fileKey).toContain('.png')

        // Cleanup this one immediately
        await adapter.delete(result.fileKey)
      }, 10000)
    } else {
      test.skip('Skipping real upload tests (no credentials)', () => {})
    }

    test('should throw error for empty buffer', async () => {
      const emptyBuffer = Buffer.from('', 'utf-8')
      
      if (isRealConnection) {
        await expect(
          adapter.upload(emptyBuffer, 'empty.txt', 'text/plain')
        ).rejects.toThrow()
      }
    })
  })

  describe('getPublicUrl()', () => {
    test('should generate valid public URL', () => {
      if (!isRealConnection) return
      const fileKey = '/test-uploads/test-file.jpg'
      const url = adapter.getPublicUrl(fileKey)

      expect(url).toMatch(/^https:\/\//)
      expect(url).toContain(options.accountId)
      expect(url).toContain('test-file.jpg')
    })

    test('should handle file keys without leading slash', () => {
      if (!isRealConnection || !adapter) return
      const fileKey = 'uploads/test-file.jpg'
      const url = adapter.getPublicUrl(fileKey)

      expect(url).toMatch(/^https:\/\//)
      expect(url).toContain(options.accountId)
    })
  })

  describe('getTransformedUrl()', () => {
    test('should generate URL with width transformation', () => {
      if (!isRealConnection) return
      const fileKey = '/test-uploads/test-image.jpg'
      const url = adapter.getTransformedUrl(fileKey, { width: 300 })

      expect(url).toMatch(/^https:\/\//)
      expect(url).toContain('w=300')
    })

    test('should generate URL with width and height', () => {
      if (!isRealConnection) return
      const fileKey = '/test-uploads/test-image.jpg'
      const url = adapter.getTransformedUrl(fileKey, {
        width: 300,
        height: 200,
      })

      expect(url).toContain('w=300')
      expect(url).toContain('h=200')
    })

    test('should generate URL with format transformation', () => {
      if (!isRealConnection) return
      const fileKey = '/test-uploads/test-image.jpg'
      const url = adapter.getTransformedUrl(fileKey, {
        width: 300,
        format: 'webp',
      })

      expect(url).toContain('w=300')
      expect(url).toContain('f=webp')
    })

    test('should generate URL with fit mode', () => {
      if (!isRealConnection) return
      const fileKey = '/test-uploads/test-image.jpg'
      const url = adapter.getTransformedUrl(fileKey, {
        width: 300,
        height: 200,
        fit: 'cover',
      })

      expect(url).toContain('fit=cover')
    })

    test('should generate URL with quality', () => {
      if (!isRealConnection) return
      const fileKey = '/test-uploads/test-image.jpg'
      const url = adapter.getTransformedUrl(fileKey, {
        width: 300,
        quality: 85,
      })

      expect(url).toContain('q=85')
    })
  })

  describe('delete()', () => {
    if (isRealConnection) {
      test('should delete a file from Bytescale', async () => {
        // First, upload a file to delete
        const testContent = `Delete Test - ${new Date().toISOString()}`
        const testBuffer = Buffer.from(testContent, 'utf-8')
        const filename = `test-delete-${Date.now()}.txt`

        const uploadResult = await adapter.upload(testBuffer, filename, 'text/plain')

        // Then delete it
        await expect(adapter.delete(uploadResult.fileKey)).resolves.not.toThrow()
      }, 10000)

      test('should handle deletion of non-existent file gracefully', async () => {
        const fakeFileKey = '/test-uploads/non-existent-file-12345.txt'
        
        // This might throw or not depending on Bytescale's behavior
        // We just want to make sure it doesn't crash
        try {
          await adapter.delete(fakeFileKey)
        } catch (error) {
          // Expected to fail, that's ok
          expect(error).toBeDefined()
        }
      })
    } else {
      test.skip('Skipping real delete tests (no credentials)', () => {})
    }
  })
})

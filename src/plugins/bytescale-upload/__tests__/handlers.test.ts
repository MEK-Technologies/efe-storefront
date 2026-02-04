/**
 * Upload Handler Tests
 * Tests for file upload handling logic
 */

import { describe, expect, test } from '@jest/globals'
import { handleUpload } from '../handlers/uploadHandler'
import { BytescaleAdapter } from '../bytescale-adapter'
import type { BytescalePluginOptions } from '../types'

describe('Upload Handler', () => {
  const options: BytescalePluginOptions = {
    apiKey: process.env.BYTESCALE_API_KEY || 'secret_test_fallback',
    accountId: process.env.BYTESCALE_ACCOUNT_ID || 'test',
    prefix: '/test-uploads',
    enabled: true,
    debug: false,
  }

  const adapter = new BytescaleAdapter(options)
  const isRealConnection = !!(process.env.BYTESCALE_API_KEY && process.env.BYTESCALE_ACCOUNT_ID)

  describe('handleUpload() with Buffer', () => {
    if (isRealConnection) {
      test('should handle plain buffer upload', async () => {
        const testContent = `Handler Test - ${new Date().toISOString()}`
        const testBuffer = Buffer.from(testContent, 'utf-8')

        const result = await handleUpload(
          {
            data: testBuffer,
            name: 'handler-test.txt',
            mimetype: 'text/plain',
            size: testBuffer.length,
          },
          adapter
        )

        expect(result).toBeDefined()
        expect(result.url).toMatch(/^https:\/\//)
        expect(result.fileKey).toBeTruthy()
        expect(result.filename).toContain('handler-test')
        expect(result.filename).toContain('.txt')
        expect(result.mimeType).toBe('text/plain')
        expect(result.filesize).toBe(testBuffer.length)

        // Cleanup
        await adapter.delete(result.fileKey)
      }, 10000)
    } else {
      test.skip('Skipping real handler tests (no credentials)', () => {})
    }
  })

  describe('handleUpload() with Base64', () => {
    test('should handle base64 string', async () => {
      if (!isRealConnection) return

      const base64Content = 'SGVsbG8gV29ybGQ=' // "Hello World"

      const result = await handleUpload(
        {
          data: base64Content,
          name: 'base64-test.txt',
          mimetype: 'text/plain',
          size: 11,
        },
        adapter
      )

      expect(result).toBeDefined()
      expect(result.url).toMatch(/^https:\/\//)
      expect(result.filename).toContain('base64-test')

      // Cleanup
      await adapter.delete(result.fileKey)
    }, 10000)

    test('should handle data URI with MIME type', async () => {
      if (!isRealConnection) return

      const dataUri = 'data:text/plain;base64,SGVsbG8gV29ybGQ='

      const result = await handleUpload(
        {
          data: dataUri,
          name: 'datauri-test.txt',
          mimetype: 'text/plain',
          size: 11,
        },
        adapter
      )

      expect(result).toBeDefined()
      expect(result.mimeType).toBe('text/plain')

      // Cleanup
      await adapter.delete(result.fileKey)
    }, 10000)
  })

  describe('Filename sanitization', () => {
    if (isRealConnection) {
      test('should sanitize filename with special characters', async () => {
        const testBuffer = Buffer.from('test content', 'utf-8')

        const result = await handleUpload(
          {
            data: testBuffer,
            name: 'My File (1) @#$%.txt',
            mimetype: 'text/plain',
            size: testBuffer.length,
          },
          adapter
        )

        expect(result.filename).not.toContain('(')
        expect(result.filename).not.toContain(')')
        expect(result.filename).not.toContain('@')
        expect(result.filename).not.toContain(' ')
        expect(result.filename).toMatch(/\.txt$/)

        // Cleanup
        await adapter.delete(result.fileKey)
      }, 10000)

      test('should make filename unique with timestamp', async () => {
        const testBuffer = Buffer.from('test', 'utf-8')

        const result1 = await handleUpload(
          {
            data: testBuffer,
            name: 'duplicate.txt',
            mimetype: 'text/plain',
            size: testBuffer.length,
          },
          adapter
        )

        await new Promise((resolve) => setTimeout(resolve, 10))

        const result2 = await handleUpload(
          {
            data: testBuffer,
            name: 'duplicate.txt',
            mimetype: 'text/plain',
            size: testBuffer.length,
          },
          adapter
        )

        expect(result1.filename).not.toBe(result2.filename)
        expect(result1.fileKey).not.toBe(result2.fileKey)

        // Cleanup
        await adapter.delete(result1.fileKey)
        await adapter.delete(result2.fileKey)
      }, 10000)
    }
  })

  describe('Error handling', () => {
    test('should throw error for invalid base64', async () => {
      if (!isRealConnection) return
      await expect(
        handleUpload(
          {
            data: 'invalid-base64!!!',
            name: 'test.txt',
            mimetype: 'text/plain',
            size: 100,
          },
          adapter
        )
      ).rejects.toThrow()
    })
  })
})

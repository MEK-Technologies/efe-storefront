/**
 * Hooks Tests
 * Tests for Payload CMS hooks integration
 */

import { describe, test, expect, beforeAll } from 'bun:test'
import { createBeforeChangeHook } from '../hooks/beforeChangeHook'
import { createAfterDeleteHook } from '../hooks/afterDeleteHook'
import { createAfterReadHook } from '../hooks/afterReadHook'
import type { BytescalePluginOptions } from '../types'

describe('Payload Hooks', () => {
  const isRealConnection = !!(process.env.BYTESCALE_API_KEY && process.env.BYTESCALE_ACCOUNT_ID)
  
  const options: BytescalePluginOptions = {
    apiKey: process.env.BYTESCALE_API_KEY || 'secret_test_fallback',
    accountId: process.env.BYTESCALE_ACCOUNT_ID || 'test',
    prefix: '/test-uploads',
    enabled: true,
    debug: false,
  }

  describe('createBeforeChangeHook()', () => {
    test('should create a function', () => {
      const hook = createBeforeChangeHook(options)
      expect(typeof hook).toBe('function')
    })

    test('should pass through data when no file is present', async () => {
      const hook = createBeforeChangeHook(options)
      
      const mockData = { title: 'Test Document' }
      const mockReq = {} as any
      
      const result = await hook({
        data: mockData,
        req: mockReq,
        operation: 'create',
      } as any)

      expect(result).toEqual(mockData)
    })

    test('should pass through data on update operations', async () => {
      const hook = createBeforeChangeHook(options)
      
      const mockData = { title: 'Test Document' }
      const mockReq = { file: { name: 'test.txt' } } as any
      
      const result = await hook({
        data: mockData,
        req: mockReq,
        operation: 'update',
      } as any)

      expect(result).toEqual(mockData)
    })

    if (isRealConnection) {
      test('should upload file and update data', async () => {
        const hook = createBeforeChangeHook(options)
        
        const testContent = Buffer.from('Test content', 'utf-8')
        const mockData = { title: 'Test Upload' }
        const mockReq = {
          file: {
            name: 'test-hook.txt',
            data: testContent,
            mimetype: 'text/plain',
            size: testContent.length,
          },
        } as any

        const result = await hook({
          data: mockData,
          req: mockReq,
          operation: 'create',
        } as any)

        expect(result).toBeDefined()
        expect(result.url).toMatch(/^https:\/\//)
        expect(result.bytescaleKey).toBeTruthy()
        expect(result.filename).toContain('test-hook')
        expect(result.mimeType).toBe('text/plain')
        expect(mockReq.file).toBeUndefined() // Should be removed

        // Note: Cleanup would need to be done manually or in integration tests
      }, 10000)
    }
  })

  describe('createAfterDeleteHook()', () => {
    test('should create a function', () => {
      const hook = createAfterDeleteHook(options)
      expect(typeof hook).toBe('function')
    })

    test('should pass through doc when no bytescaleKey present', async () => {
      const hook = createAfterDeleteHook(options)
      
      const mockDoc = { id: '123', title: 'Test' }
      
      const result = await hook({
        doc: mockDoc,
        req: {} as any,
      } as any)

      expect(result).toEqual(mockDoc)
    })

    test('should not throw error when bytescaleKey is invalid', async () => {
      const hook = createAfterDeleteHook(options)
      
      const mockDoc = {
        id: '123',
        bytescaleKey: '/invalid/path/file.txt',
      }
      
      // Should not throw, just log error
      const result = await hook({
        doc: mockDoc,
        req: {} as any,
      } as any)

      expect(result).toEqual(mockDoc)
    })
  })

  describe('createAfterReadHook()', () => {
    test('should create a function', () => {
      const hook = createAfterReadHook(options)
      expect(typeof hook).toBe('function')
    })

    test('should pass through doc when no bytescaleKey present', async () => {
      const hook = createAfterReadHook(options)
      
      const mockDoc = { id: '123', title: 'Test' }
      
      const result = await hook({
        doc: mockDoc,
        req: {} as any,
      } as any)

      expect(result).toEqual(mockDoc)
    })

    test('should generate public URL for doc with bytescaleKey', async () => {
      if (!isRealConnection) return

      const hook = createAfterReadHook(options)
      
      const mockDoc = {
        id: '123',
        bytescaleKey: '/test-uploads/test-file.jpg',
        url: 'old-url',
      }
      
      const result = await hook({
        doc: mockDoc,
        req: {} as any,
      } as any)

      expect(result.url).toMatch(/^https:\/\//)
      expect(result.url).toContain(options.accountId)
      expect(result.url).not.toBe('old-url')
    })

    test('should generate URLs for image sizes', async () => {
      if (!isRealConnection) return

      const hook = createAfterReadHook(options)
      
      const mockDoc = {
        id: '123',
        bytescaleKey: '/test-uploads/original.jpg',
        sizes: {
          thumbnail: {
            bytescaleKey: '/test-uploads/thumbnail.jpg',
            width: 300,
            height: 200,
            url: 'old-thumbnail-url',
          },
          card: {
            bytescaleKey: '/test-uploads/card.jpg',
            width: 768,
            height: 1024,
            url: 'old-card-url',
          },
        },
      }
      
      const result = await hook({
        doc: mockDoc,
        req: {} as any,
      } as any)

      expect(result.sizes.thumbnail.url).toMatch(/^https:\/\//)
      expect(result.sizes.thumbnail.url).not.toBe('old-thumbnail-url')
      expect(result.sizes.thumbnail.transformedUrl).toBeDefined()
      expect(result.sizes.thumbnail.transformedUrl).toContain('w=300')
      expect(result.sizes.thumbnail.transformedUrl).toContain('h=200')

      expect(result.sizes.card.url).toMatch(/^https:\/\//)
      expect(result.sizes.card.url).not.toBe('old-card-url')
    })

    test('should handle null doc gracefully', async () => {
      const hook = createAfterReadHook(options)
      
      const result = await hook({
        doc: null,
        req: {} as any,
      } as any)

      expect(result).toBe(null)
    })
  })
})

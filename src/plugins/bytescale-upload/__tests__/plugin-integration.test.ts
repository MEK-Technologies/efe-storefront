/**
 * Plugin Integration Tests
 * Tests for the complete plugin integration with Payload CMS
 */

import { describe, expect, test } from '@jest/globals'
import { bytescaleUploadPlugin } from '../plugin'
import type { Config } from 'payload'
import type { BytescalePluginOptions } from '../types'

describe('Bytescale Plugin Integration', () => {
  const resolveConfig = async (configOrPromise: Config | Promise<Config>) =>
    await Promise.resolve(configOrPromise)

  const options: BytescalePluginOptions = {
    apiKey: 'test-api-key-1234567890',
    accountId: 'test-account-id',
    prefix: '/test-uploads',
    enabled: true,
    debug: false,
  }

  describe('Plugin initialization', () => {
    test('should throw error if apiKey is missing', () => {
      expect(() => {
        bytescaleUploadPlugin({
          apiKey: '',
          accountId: 'test',
          enabled: true,
        })
      }).toThrow('Bytescale API Key is required')
    })

    test('should throw error if accountId is missing', () => {
      expect(() => {
        bytescaleUploadPlugin({
          apiKey: 'test',
          accountId: '',
          enabled: true,
        })
      }).toThrow('Bytescale Account ID is required')
    })

    test('should return a function', () => {
      const plugin = bytescaleUploadPlugin(options)
      expect(typeof plugin).toBe('function')
    })
  })

  describe('Config modification', () => {
    test('should return config when plugin is disabled', async () => {
      const disabledOptions: BytescalePluginOptions = {
        ...options,
        enabled: false,
      }
      
      const plugin = bytescaleUploadPlugin(disabledOptions)
      const mockConfig: Config = {
        collections: [],
      } as any

      const result = await resolveConfig(plugin(mockConfig))
      expect(result).toEqual(mockConfig)
    })

    test('should not modify collections without upload', async () => {
      const plugin = bytescaleUploadPlugin(options)
      const mockConfig: Config = {
        collections: [
          {
            slug: 'posts',
            fields: [
              { name: 'title', type: 'text' },
            ],
          },
        ],
      } as any

      const result = await resolveConfig(plugin(mockConfig))
      
      expect(result.collections).toBeDefined()
      expect(result.collections![0]).toEqual(mockConfig.collections![0])
    })

    test('should add bytescaleKey field to upload collections', async () => {
      const plugin = bytescaleUploadPlugin(options)
      const mockConfig: Config = {
        collections: [
          {
            slug: 'media',
            upload: {
              staticDir: './uploads',
            },
            fields: [
              { name: 'alt', type: 'text' },
            ],
          },
        ],
      } as any

      const result = await resolveConfig(plugin(mockConfig))
      
      expect(result.collections).toBeDefined()
      const mediaCollection = result.collections![0]
      
      // Should have added bytescaleKey field
      const bytescaleField = mediaCollection.fields.find(
        (field: any) => field.name === 'bytescaleKey'
      )
      expect(bytescaleField).toBeDefined()
      expect(bytescaleField?.type).toBe('text')
      expect((bytescaleField as any)?.admin?.readOnly).toBe(true)
      expect((bytescaleField as any)?.admin?.hidden).toBe(true)
    })

    test('should not add duplicate bytescaleKey field', async () => {
      const plugin = bytescaleUploadPlugin(options)
      const mockConfig: Config = {
        collections: [
          {
            slug: 'media',
            upload: {
              staticDir: './uploads',
            },
            fields: [
              { name: 'alt', type: 'text' },
              { name: 'bytescaleKey', type: 'text' },
            ],
          },
        ],
      } as any

      const result = await resolveConfig(plugin(mockConfig))
      
      const mediaCollection = result.collections![0]
      const bytescaleFields = mediaCollection.fields.filter(
        (field: any) => field.name === 'bytescaleKey'
      )
      
      expect(bytescaleFields.length).toBe(1)
    })

    test('should add hooks to upload collections', async () => {
      const plugin = bytescaleUploadPlugin(options)
      const mockConfig: Config = {
        collections: [
          {
            slug: 'media',
            upload: {
              staticDir: './uploads',
            },
            fields: [],
          },
        ],
      } as any

      const result = await resolveConfig(plugin(mockConfig))
      
      const mediaCollection = result.collections![0]
      
      expect(mediaCollection.hooks).toBeDefined()
      expect(mediaCollection.hooks?.beforeChange).toBeDefined()
      expect(mediaCollection.hooks?.afterDelete).toBeDefined()
      expect(mediaCollection.hooks?.afterRead).toBeDefined()
      
      expect(Array.isArray(mediaCollection.hooks?.beforeChange)).toBe(true)
      expect(mediaCollection.hooks?.beforeChange?.length).toBeGreaterThan(0)
    })

    test('should preserve existing hooks', async () => {
      const existingBeforeChange = async ({ data }: any) => data
      const existingAfterDelete = async ({ doc }: any) => doc
      
      const plugin = bytescaleUploadPlugin(options)
      const mockConfig: Config = {
        collections: [
          {
            slug: 'media',
            upload: {
              staticDir: './uploads',
            },
            fields: [],
            hooks: {
              beforeChange: [existingBeforeChange],
              afterDelete: [existingAfterDelete],
            },
          },
        ],
      } as any

      const result = await resolveConfig(plugin(mockConfig))
      
      const mediaCollection = result.collections![0]
      
      expect(mediaCollection.hooks?.beforeChange?.length).toBe(2)
      expect(mediaCollection.hooks?.beforeChange?.[0]).toBe(existingBeforeChange)
      
      expect(mediaCollection.hooks?.afterDelete?.length).toBe(2)
      expect(mediaCollection.hooks?.afterDelete?.[0]).toBe(existingAfterDelete)
    })

    test('should handle multiple upload collections', async () => {
      const plugin = bytescaleUploadPlugin(options)
      const mockConfig: Config = {
        collections: [
          {
            slug: 'media',
            upload: { staticDir: './uploads' },
            fields: [],
          },
          {
            slug: 'documents',
            upload: { staticDir: './docs' },
            fields: [],
          },
          {
            slug: 'posts',
            fields: [],
          },
        ],
      } as any

      const result = await resolveConfig(plugin(mockConfig))
      
      // Media collection should have hooks
      expect(result.collections![0].hooks?.beforeChange).toBeDefined()
      
      // Documents collection should have hooks
      expect(result.collections![1].hooks?.beforeChange).toBeDefined()
      
      // Posts collection should NOT have hooks
      expect(result.collections![2].hooks?.beforeChange).toBeUndefined()
    })
  })

  describe('Plugin options', () => {
    test('should use default prefix if not provided', () => {
      const optionsWithoutPrefix: BytescalePluginOptions = {
        apiKey: 'test-key',
        accountId: 'test-account',
        enabled: true,
      }
      
      const plugin = bytescaleUploadPlugin(optionsWithoutPrefix)
      expect(typeof plugin).toBe('function')
      
      // Plugin should initialize without errors
      const mockConfig: Config = { collections: [] } as any
      const result = plugin(mockConfig)
      expect(result).toBeDefined()
    })

    test('should handle debug option', () => {
      const debugOptions: BytescalePluginOptions = {
        ...options,
        debug: true,
      }
      
      const plugin = bytescaleUploadPlugin(debugOptions)
      const mockConfig: Config = { collections: [] } as any
      
      // Should not throw error with debug enabled
      expect(() => plugin(mockConfig)).not.toThrow()
    })
  })
})

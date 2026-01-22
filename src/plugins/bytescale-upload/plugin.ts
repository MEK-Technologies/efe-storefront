/**
 * Bytescale Upload Plugin for Payload CMS
 * Main plugin configuration
 */

import type { Config, Plugin } from 'payload'
import type { BytescalePluginOptions } from './types'
import { Logger } from './utils/logger'
import { createBeforeChangeHook } from './hooks/beforeChangeHook'
import { createAfterDeleteHook } from './hooks/afterDeleteHook'
import { createAfterReadHook } from './hooks/afterReadHook'

/**
 * Bytescale Upload Plugin
 * 
 * @param options - Plugin configuration options
 * @returns Payload Plugin function
 * 
 * @example
 * ```typescript
 * import { bytescaleUploadPlugin } from './src/plugins/bytescale-upload'
 * 
 * export default buildConfig({
 *   plugins: [
 *     bytescaleUploadPlugin({
 *       apiKey: process.env.BYTESCALE_API_KEY!,
 *       accountId: process.env.BYTESCALE_ACCOUNT_ID!,
 *       prefix: '/payload-uploads',
 *       enabled: true,
 *     })
 *   ]
 * })
 * ```
 */
export const bytescaleUploadPlugin = (options: BytescalePluginOptions): Plugin => {
  // Validate options
  if (!options.apiKey) {
    throw new Error('Bytescale API Key is required')
  }

  if (!options.accountId) {
    throw new Error('Bytescale Account ID is required')
  }

  const logger = new Logger(options.debug || false)

  // Return a function that modifies the Payload config
  return (config: Config): Config => {
    if (options.enabled === false) {
      logger.info('Bytescale plugin is disabled')
      return config
    }

    logger.info('Bytescale Upload Plugin initializing...')
    logger.debug('Configuration:', {
      accountId: options.accountId,
      prefix: options.prefix || '/payload-uploads',
      apiKeyLength: options.apiKey.length,
    })

    // Create hooks
    const beforeChangeHook = createBeforeChangeHook(options)
    const afterDeleteHook = createAfterDeleteHook(options)
    const afterReadHook = createAfterReadHook(options)

    // Extend collections that have upload enabled
    const modifiedConfig = {
      ...config,
      collections: config.collections?.map((collection) => {
        // Only modify collections with upload capability
        if (!collection.upload) {
          return collection
        }

        logger.info(`Adding Bytescale hooks to collection: ${collection.slug}`)

        // Add bytescaleKey field if not present
        const hasBytescaleKey = collection.fields?.some(
          (field) => 'name' in field && field.name === 'bytescaleKey'
        )

        const additionalFields = !hasBytescaleKey
          ? [
              {
                name: 'bytescaleKey',
                type: 'text' as const,
                admin: {
                  readOnly: true,
                  hidden: true,
                },
              },
            ]
          : []

        return {
          ...collection,
          fields: [...(collection.fields || []), ...additionalFields],
          hooks: {
            ...collection.hooks,
            beforeChange: [
              ...(collection.hooks?.beforeChange || []),
              beforeChangeHook,
            ],
            afterDelete: [
              ...(collection.hooks?.afterDelete || []),
              afterDeleteHook,
            ],
            afterRead: [
              ...(collection.hooks?.afterRead || []),
              afterReadHook,
            ],
          },
        }
      }),
    }

    logger.info('Bytescale Upload Plugin initialized successfully')

    return modifiedConfig
  }
}

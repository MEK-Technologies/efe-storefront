/**
 * After Read Hook
 * Generates fresh URLs from Bytescale when documents are read
 */

import type { CollectionAfterReadHook } from 'payload'
import { BytescaleAdapter } from '../bytescale-adapter'
import type { BytescalePluginOptions } from '../types'
import { Logger } from '../utils/logger'

/**
 * Create afterRead hook for upload collections
 */
export const createAfterReadHook = (
  options: BytescalePluginOptions
): CollectionAfterReadHook => {
  const logger = new Logger(options.debug || false)
  let adapter: BytescaleAdapter | null = null

  const getAdapter = () => {
    if (!adapter) {
      adapter = new BytescaleAdapter(options)
    }
    return adapter
  }

  return async ({ doc }) => {
    try {
      // Only process if document has a Bytescale key
      if (!doc || !doc.bytescaleKey) {
        return doc
      }

      logger.debug('Generating fresh URL for:', doc.bytescaleKey)

      // Generate fresh public URL
      doc.url = getAdapter().getPublicUrl(doc.bytescaleKey)

      // Update URLs for image sizes if they exist
      if (doc.sizes && typeof doc.sizes === 'object') {
        const sizeKeys = Object.keys(doc.sizes)

        for (const sizeName of sizeKeys) {
          const sizeData = doc.sizes[sizeName]

          if (sizeData?.bytescaleKey) {
            // Generate URL for this size
            doc.sizes[sizeName].url = getAdapter().getPublicUrl(sizeData.bytescaleKey)

            // Optionally generate transformed URL with size constraints
            if (sizeData.width || sizeData.height) {
              doc.sizes[sizeName].transformedUrl = getAdapter().getTransformedUrl(
                sizeData.bytescaleKey,
                {
                  width: sizeData.width,
                  height: sizeData.height,
                  fit: 'contain',
                  format: 'auto',
                }
              )
            }

            logger.debug(`URL updated for size "${sizeName}"`)
          }
        }
      }

      return doc
    } catch (error) {
      // Log error but return doc anyway to not break reads
      logger.error('Error generating Bytescale URLs:', error)
      return doc
    }
  }
}

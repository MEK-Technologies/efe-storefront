/**
 * After Delete Hook
 * Cleans up files from Bytescale when documents are deleted
 */

import type { CollectionAfterDeleteHook } from 'payload'
import { BytescaleAdapter } from '../bytescale-adapter'
import type { BytescalePluginOptions } from '../types'
import { Logger } from '../utils/logger'

/**
 * Create afterDelete hook for upload collections
 */
export const createAfterDeleteHook = (
  options: BytescalePluginOptions
): CollectionAfterDeleteHook => {
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
      // Check if document has a Bytescale key
      if (!doc.bytescaleKey) {
        logger.debug('No Bytescale key found, skipping cleanup')
        return doc
      }

      logger.debug('Deleting file from Bytescale:', doc.bytescaleKey)

      // Delete main file from Bytescale
      await getAdapter().delete(doc.bytescaleKey)

      logger.info('File deleted from Bytescale:', doc.bytescaleKey)

      // Delete image sizes if they exist
      if (doc.sizes && typeof doc.sizes === 'object') {
        const sizeKeys = Object.keys(doc.sizes)
        
        for (const sizeName of sizeKeys) {
          const sizeData = doc.sizes[sizeName]
          
          if (sizeData?.bytescaleKey) {
            try {
              logger.debug(`Deleting size "${sizeName}":`, sizeData.bytescaleKey)
              await getAdapter().delete(sizeData.bytescaleKey)
              logger.info(`Size "${sizeName}" deleted from Bytescale`)
            } catch (error) {
              // Log but don't fail if size deletion fails
              logger.warn(`Failed to delete size "${sizeName}":`, error)
            }
          }
        }
      }

      return doc
    } catch (error) {
      // Log error but don't fail the deletion operation
      logger.error('Error cleaning up Bytescale files:', error)
      logger.warn('Document was deleted but Bytescale cleanup may have failed')
      
      return doc
    }
  }
}

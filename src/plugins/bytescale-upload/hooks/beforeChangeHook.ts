/**
 * Before Change Hook
 * Intercepts file uploads and sends them to Bytescale
 */

import type { CollectionBeforeChangeHook } from 'payload'
import { BytescaleAdapter } from '../bytescale-adapter'
import type { BytescalePluginOptions } from '../types'
import { handleUpload } from '../handlers/uploadHandler'
import { Logger } from '../utils/logger'

/**
 * Create beforeChange hook for upload collections
 */
export const createBeforeChangeHook = (
  options: BytescalePluginOptions
): CollectionBeforeChangeHook => {
  const logger = new Logger(options.debug || false)
  let adapter: BytescaleAdapter | null = null

  const getAdapter = () => {
    if (!adapter) {
      adapter = new BytescaleAdapter(options)
    }
    return adapter
  }

  return async ({ data, req, operation }) => {
    // Only process on create operations with file uploads
    if (operation !== 'create' || !req.file) {
      return data
    }

    try {
      logger.debug('Processing file upload:', req.file.name)

      // Upload main file to Bytescale
      const uploadResult = await handleUpload(
        {
          data: req.file.data,
          name: req.file.name,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
        getAdapter()
      )

      logger.info('File uploaded to Bytescale:', uploadResult.filename)

      // Update document data with Bytescale info
      data.url = uploadResult.url
      data.filename = uploadResult.filename
      data.mimeType = uploadResult.mimeType
      data.filesize = uploadResult.filesize

      // Store Bytescale-specific data
      data.bytescaleKey = uploadResult.fileKey

      if (uploadResult.width) {
        data.width = uploadResult.width
      }

      if (uploadResult.height) {
        data.height = uploadResult.height
      }

      // Remove the file from the request to prevent Payload from saving it locally
      delete req.file

      logger.debug('File data updated, local save prevented')

      return data
    } catch (error) {
      logger.error('Failed to upload file to Bytescale:', error)
      
      // Re-throw to fail the operation
      throw new Error(
        `Bytescale upload failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}

/**
 * Bytescale Adapter
 * Handles all interactions with the Bytescale API
 */

import * as Bytescale from '@bytescale/sdk'
import type { BytescalePluginOptions, IBytescaleAdapter, TransformationOptions } from './types'
import { normalizePath } from './utils/path-normalizer'
import { Logger } from './utils/logger'

// Use native fetch (Node 18+)
const fetchApi = globalThis.fetch || fetch

export class BytescaleAdapter implements IBytescaleAdapter {
  private uploadManager: Bytescale.UploadManager
  private fileApi: Bytescale.FileApi
  private options: BytescalePluginOptions
  private logger: Logger

  constructor(options: BytescalePluginOptions) {
    this.options = options
    this.logger = new Logger(options.debug || false)

    // Validate required options
    if (!options.apiKey) {
      throw new Error('Bytescale API Key is required')
    }

    if (!options.accountId) {
      throw new Error('Bytescale Account ID is required')
    }

    // Initialize Bytescale SDK using native fetch
    this.uploadManager = new Bytescale.UploadManager({
      fetchApi: fetchApi as any,
      apiKey: options.apiKey,
    })

    this.fileApi = new Bytescale.FileApi({
      fetchApi: fetchApi as any,
      apiKey: options.apiKey,
    })

    this.logger.info('Bytescale adapter initialized')
    this.logger.debug('Upload path:', this.getUploadPath())
  }

  /**
   * Upload a file to Bytescale using Raw Upload API
   * This bypasses the multipart upload that causes 501 errors
   */
  async upload(
    file: Buffer,
    filename: string,
    mimeType: string
  ): Promise<{
    url: string
    fileKey: string
  }> {
    try {
      this.logger.debug(`Uploading file: ${filename} (${mimeType})`)

      // Use Raw Upload API directly
      const folderPath = this.getUploadPath()
      const filePath = `${folderPath}/${filename}`
      
      const url = `https://api.bytescale.com/v2/accounts/${this.options.accountId}/uploads/binary`
      
      const response = await fetchApi(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.options.apiKey}`,
          'Content-Type': mimeType,
          'X-Upload-File-Path': filePath,
        },
        body: file,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Upload failed (${response.status}): ${errorText}`)
      }

      const result = await response.json() as any

      this.logger.info(`File uploaded successfully: ${filename}`)
      this.logger.debug('Bytescale response:', result)

      const fileUrl = result.fileUrl || `https://upcdn.io/${this.options.accountId}/raw${filePath}`
      
      return {
        url: fileUrl,
        fileKey: result.filePath || filePath,
      }
    } catch (error) {
      this.logger.error(`Failed to upload file: ${filename}`, error)
      throw new Error(
        `Bytescale upload failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Delete a file from Bytescale
   */
  async delete(fileKey: string): Promise<void> {
    try {
      this.logger.debug(`Deleting file: ${fileKey}`)

      await this.fileApi.deleteFile({
        accountId: this.options.accountId,
        filePath: fileKey,
      })

      this.logger.info(`File deleted successfully: ${fileKey}`)
    } catch (error) {
      this.logger.error(`Failed to delete file: ${fileKey}`, error)
      // Don't throw - deletion failures shouldn't break the application
      this.logger.warn('File deletion failed, but continuing...')
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(fileKey: string): string {
    return Bytescale.UrlBuilder.url({
      accountId: this.options.accountId,
      filePath: fileKey,
    })
  }

  /**
   * Get public URL with transformations
   */
  getTransformedUrl(fileKey: string, transformations: TransformationOptions): string {
    const transformationParams: Record<string, string> = {}

    if (transformations.width) {
      transformationParams.w = String(transformations.width)
    }

    if (transformations.height) {
      transformationParams.h = String(transformations.height)
    }

    if (transformations.fit) {
      transformationParams.fit = transformations.fit
    }

    if (transformations.quality) {
      transformationParams.q = String(transformations.quality)
    }

    if (transformations.format) {
      transformationParams.f = transformations.format
    }

    return Bytescale.UrlBuilder.url({
      accountId: this.options.accountId,
      filePath: fileKey,
      options: {
        transformation: 'image',
        transformationParams,
      },
    })
  }

  /**
   * Get normalized upload path
   */
  private getUploadPath(): string {
    return normalizePath(this.options.prefix || '/payload-uploads')
  }
}

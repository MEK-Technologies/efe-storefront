/**
 * Upload Handler
 * Handles file uploads to Bytescale
 */

import { BytescaleAdapter } from '../bytescale-adapter'
import type { BytescaleUploadResult, FileToUpload } from '../types'
import { decodeBase64, getMimeTypeFromDataUri, isBase64 } from '../utils/base64-decoder'
import { addTimestampToFilename, sanitizeFilename } from '../utils/path-normalizer'

/**
 * Handle file upload to Bytescale
 * Supports both Buffer and base64 string inputs
 */
export async function handleUpload(
  file: FileToUpload,
  adapter: BytescaleAdapter
): Promise<BytescaleUploadResult> {
  try {
    // Convert data to Buffer if it's base64
    let fileBuffer: Buffer
    let mimeType = file.mimetype

    if (typeof file.data === 'string') {
      // Check if it's base64 encoded
      if (isBase64(file.data)) {
        fileBuffer = decodeBase64(file.data, file.name)

        // Extract MIME type from data URI if present
        const dataUriMimeType = getMimeTypeFromDataUri(file.data)
        if (dataUriMimeType) {
          mimeType = dataUriMimeType
        }
      } else {
        // If it's a regular string, convert to buffer
        fileBuffer = Buffer.from(file.data, 'utf-8')
      }
    } else {
      fileBuffer = file.data
    }

    // Sanitize and make filename unique
    const sanitizedName = sanitizeFilename(file.name)
    const uniqueName = addTimestampToFilename(sanitizedName)

    // Upload to Bytescale
    const uploadResult = await adapter.upload(fileBuffer, uniqueName, mimeType)

    // Get image dimensions if it's an image
    let width: number | undefined
    let height: number | undefined

    if (mimeType.startsWith('image/')) {
      // TODO: Extract dimensions from image buffer if needed
      // For now, we'll let Bytescale handle this
    }

    return {
      url: uploadResult.url,
      fileKey: uploadResult.fileKey,
      filename: uniqueName,
      mimeType,
      filesize: fileBuffer.length,
      width,
      height,
    }
  } catch (error) {
    throw new Error(
      `Upload handler failed: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Handle upload of image sizes (thumbnails, etc.)
 * Called by Payload after generating resized images
 */
export async function handleImageSizeUpload(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  adapter: BytescaleAdapter
): Promise<{
  url: string
  fileKey: string
}> {
  try {
    const sanitizedName = sanitizeFilename(filename)
    const uniqueName = addTimestampToFilename(sanitizedName)

    return await adapter.upload(buffer, uniqueName, mimeType)
  } catch (error) {
    throw new Error(
      `Image size upload failed: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

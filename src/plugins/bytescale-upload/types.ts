/**
 * Bytescale Upload Plugin Types
 * TypeScript definitions for the Bytescale upload plugin
 */

/**
 * Plugin configuration options
 */
export interface BytescalePluginOptions {
  /**
   * Bytescale API Key (required)
   * Get this from your Bytescale dashboard
   */
  apiKey: string

  /**
   * Bytescale Account ID (required)
   * Get this from your Bytescale dashboard
   */
  accountId: string

  /**
   * Folder prefix for uploads (optional)
   * Default: '/payload-uploads'
   * Example: '/my-app/uploads'
   */
  prefix?: string

  /**
   * Enable or disable the plugin (optional)
   * Default: true
   */
  enabled?: boolean

  /**
   * Enable debug logging (optional)
   * Default: false
   */
  debug?: boolean
}

/**
 * Upload result from Bytescale
 */
export interface BytescaleUploadResult {
  /**
   * Public URL of the uploaded file
   */
  url: string

  /**
   * Bytescale file key/path
   */
  fileKey: string

  /**
   * Original filename
   */
  filename: string

  /**
   * MIME type
   */
  mimeType: string

  /**
   * File size in bytes
   */
  filesize: number

  /**
   * Image dimensions (if applicable)
   */
  width?: number
  height?: number
}

/**
 * File data for upload
 */
export interface FileToUpload {
  /**
   * File data as Buffer or base64 string
   */
  data: Buffer | string

  /**
   * Original filename
   */
  name: string

  /**
   * MIME type
   */
  mimetype: string

  /**
   * File size in bytes (optional)
   */
  size?: number
}

/**
 * Bytescale adapter interface
 */
export interface IBytescaleAdapter {
  /**
   * Upload a file to Bytescale
   */
  upload(file: Buffer, filename: string, mimeType: string): Promise<{
    url: string
    fileKey: string
  }>

  /**
   * Delete a file from Bytescale
   */
  delete(fileKey: string): Promise<void>

  /**
   * Get public URL for a file
   */
  getPublicUrl(fileKey: string): string

  /**
   * Get public URL with transformations
   */
  getTransformedUrl(fileKey: string, transformations: TransformationOptions): string
}

/**
 * Image transformation options
 */
export interface TransformationOptions {
  width?: number
  height?: number
  fit?: 'contain' | 'cover' | 'crop' | 'scale-down'
  quality?: number
  format?: 'auto' | 'jpeg' | 'png' | 'webp' | 'avif'
}

/**
 * Plugin logger interface
 */
export interface ILogger {
  info(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
  debug(message: string, ...args: any[]): void
}

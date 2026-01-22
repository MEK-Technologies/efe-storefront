/**
 * Bytescale Upload Plugin
 * Entry point for the plugin
 */

export { bytescaleUploadPlugin } from './plugin'
export { BytescaleAdapter } from './bytescale-adapter'
export { createBeforeChangeHook } from './hooks/beforeChangeHook'
export { createAfterDeleteHook } from './hooks/afterDeleteHook'
export { createAfterReadHook } from './hooks/afterReadHook'
export { handleUpload } from './handlers/uploadHandler'
export type {
  BytescalePluginOptions,
  BytescaleUploadResult,
  FileToUpload,
  IBytescaleAdapter,
  TransformationOptions,
  ILogger,
} from './types'

/**
 * Simple logger for the Bytescale plugin
 */

import type { ILogger } from '../types'

export class Logger implements ILogger {
  private prefix = '[Bytescale Plugin]'
  private debugEnabled: boolean

  constructor(debug = false) {
    this.debugEnabled = debug
  }

  info(message: string, ...args: any[]): void {
    console.log(`${this.prefix} ℹ️  ${message}`, ...args)
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`${this.prefix} ⚠️  ${message}`, ...args)
  }

  error(message: string, ...args: any[]): void {
    console.error(`${this.prefix} ❌ ${message}`, ...args)
  }

  debug(message: string, ...args: any[]): void {
    if (this.debugEnabled) {
      console.debug(`${this.prefix} 🔍 ${message}`, ...args)
    }
  }
}

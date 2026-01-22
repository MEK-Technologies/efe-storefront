/**
 * Bytescale Connection Test
 * 
 * Run with: bun run test:bytescale
 * 
 * This script tests the Bytescale connection by:
 * 1. Creating a test file
 * 2. Uploading it to Bytescale
 * 3. Getting the public URL
 * 4. Deleting the file
 */

import { BytescaleAdapter } from './bytescale-adapter'
import type { BytescalePluginOptions } from './types'

// ANSI color codes for pretty console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function testBytescaleConnection() {
  log('\n🧪 Testing Bytescale Connection...\n', 'cyan')

  // Check environment variables
  const apiKey = process.env.BYTESCALE_API_KEY
  const accountId = process.env.BYTESCALE_ACCOUNT_ID
  const prefix = process.env.BYTESCALE_PREFIX || '/payload-uploads'

  if (!apiKey || !accountId) {
    log('❌ ERROR: Missing environment variables', 'red')
    log('\nPlease set the following in your .env.local:', 'yellow')
    log('  BYTESCALE_API_KEY=your_api_key', 'yellow')
    log('  BYTESCALE_ACCOUNT_ID=your_account_id', 'yellow')
    log('  BYTESCALE_PREFIX=/payload-uploads (optional)\n', 'yellow')
    process.exit(1)
  }

  log(`✓ Found BYTESCALE_API_KEY: ${apiKey.substring(0, 10)}...`, 'green')
  log(`✓ Found BYTESCALE_ACCOUNT_ID: ${accountId}`, 'green')
  log(`✓ Upload path: ${prefix}\n`, 'green')

  // Initialize adapter
  const options: BytescalePluginOptions = {
    apiKey,
    accountId,
    prefix,
    enabled: true,
    debug: true,
  }

  let adapter: BytescaleAdapter
  let fileKey: string | undefined

  try {
    log('📦 Initializing Bytescale Adapter...', 'blue')
    adapter = new BytescaleAdapter(options)
    log('✓ Adapter initialized successfully\n', 'green')
  } catch (error) {
    log('❌ Failed to initialize adapter:', 'red')
    console.error(error)
    process.exit(1)
  }

  try {
    // Create a test file
    log('📝 Creating test file...', 'blue')
    const testContent = `Bytescale Test - ${new Date().toISOString()}`
    const testBuffer = Buffer.from(testContent, 'utf-8')
    const testFilename = `test-${Date.now()}.txt`
    log(`✓ Test file created: ${testFilename} (${testBuffer.length} bytes)\n`, 'green')

    // Upload the file
    log('⬆️  Uploading to Bytescale...', 'blue')
    const uploadResult = await adapter.upload(testBuffer, testFilename, 'text/plain')
    fileKey = uploadResult.fileKey
    log('✓ Upload successful!', 'green')
    log(`  File Key: ${uploadResult.fileKey}`, 'cyan')
    log(`  URL: ${uploadResult.url}\n`, 'cyan')

    // Get public URL
    log('🔗 Getting public URL...', 'blue')
    const publicUrl = adapter.getPublicUrl(uploadResult.fileKey)
    log('✓ Public URL generated:', 'green')
    log(`  ${publicUrl}\n`, 'cyan')

    // Test transformed URL
    log('🖼️  Getting transformed URL (100x100, webp)...', 'blue')
    const transformedUrl = adapter.getTransformedUrl(uploadResult.fileKey, {
      width: 100,
      height: 100,
      fit: 'contain',
      format: 'webp',
    })
    log('✓ Transformed URL generated:', 'green')
    log(`  ${transformedUrl}\n`, 'cyan')

    // Wait a bit before deletion
    log('⏳ Waiting 2 seconds before cleanup...', 'yellow')
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Delete the file
    log('🗑️  Deleting test file...', 'blue')
    await adapter.delete(uploadResult.fileKey)
    log('✓ File deleted successfully\n', 'green')

    // Success summary
    log('━'.repeat(50), 'green')
    log('✅ ALL TESTS PASSED!', 'green')
    log('━'.repeat(50), 'green')
    log('\nBytescale is configured correctly and working! 🎉\n', 'cyan')
    log('You can now use the plugin in your Payload config.\n', 'cyan')
  } catch (error) {
    log('\n❌ TEST FAILED:', 'red')
    console.error(error)

    // Attempt cleanup
    if (fileKey) {
      try {
        log('\n🧹 Attempting cleanup...', 'yellow')
        await adapter.delete(fileKey)
        log('✓ Cleanup successful', 'green')
      } catch (cleanupError) {
        log('⚠️  Cleanup failed (file may need manual deletion)', 'yellow')
      }
    }

    process.exit(1)
  }
}

// Run the test
testBytescaleConnection().catch((error) => {
  console.error('\n💥 Unexpected error:', error)
  process.exit(1)
})

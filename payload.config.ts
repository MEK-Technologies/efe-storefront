// CRITICAL: Load File API polyfill FIRST
import './payload-polyfill.js'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Import collections
import { Users } from './src/collections/User.ts'
import { Categories } from './src/collections/Categories.ts'
import { Banners } from './src/collections/Banners.ts'
import { Slides } from './src/collections/Slides.ts'
import { Products } from './src/collections/Products.ts'
import { Collections } from './src/collections/Collections.ts'
import { Ordenes } from './src/collections/Ordenes.ts'

// Import Bytescale plugin
import { bytescaleUploadPlugin } from './src/plugins/bytescale-upload/index.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Check if Payload is configured
const isPayloadEnabled = !!(process.env.PAYLOAD_SECRET && process.env.PAYLOAD_DATABASE_URL)

// Check if Bytescale is configured
const isBytescaleEnabled = !!(process.env.BYTESCALE_API_KEY && process.env.BYTESCALE_ACCOUNT_ID)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    disable: !isPayloadEnabled,
    components: {
      // Custom views for orders dashboard
      views: {
        OrdenesDashboard: {
          Component: './src/components/admin/OrdenesDashboard.tsx#OrdenesDashboard',
          path: '/dashboard-ordenes',
        },
      },
      // Add link to orders dashboard after nav
      afterNavLinks: [
        './src/components/admin/OrdenesDashboardLink.tsx#OrdenesDashboardLink',
      ],
    },
  },
  collections: [
    // User collection for authentication
    // Migrated to src/collections/User.ts
    Users,
    // Media collection for file uploads
    {
      slug: 'media',
      access: {
        read: () => true, // Allow public read access to media files
      },
      upload: {
        staticDir: path.resolve(dirname, 'public/uploads'),
        imageSizes: [
          {
            name: 'thumbnail',
            width: 400,
            height: 300,
            position: 'centre',
          },
          {
            name: 'card',
            width: 768,
            height: 1024,
            position: 'centre',
          },
          {
            name: 'tablet',
            width: 1024,
            // By specifying `undefined` or leaving a height undefined,
            // the image will be sized to a certain width,
            // but it will retain its original aspect ratio
            // and calculate a height automatically.
            height: undefined,
            position: 'centre',
          },
        ],
        adminThumbnail: 'thumbnail',
        mimeTypes: ['image/*'],
      },
      fields: [
        {
          name: 'alt',
          type: 'text',
          required: true,
        },
      ],
    },
    // Custom collections
    // DISABLED: Only enable if tables already exist in database
    // Pages,
    Categories, // Required for Slides relationship
    Banners,
    Slides,
    Products, // Productos del catálogo
    Collections, // Colecciones de productos
    Ordenes, // Órdenes de clientes
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'TEMP_SECRET_PLEASE_CONFIGURE_ENV_VARIABLES_12345678901234567890',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.PAYLOAD_DATABASE_URL || 'postgres://admin:password@127.0.0.1:5432/payload',
    },
    push: false, // DISABLED: Prevent Payload from modifying existing tables (products, etc.)
  }),
  sharp,
  plugins: [
    // Bytescale Upload Plugin (only if configured)
    ...(isBytescaleEnabled
      ? [
          bytescaleUploadPlugin({
            apiKey: process.env.BYTESCALE_API_KEY || '',
            accountId: process.env.BYTESCALE_ACCOUNT_ID || '',
            prefix: process.env.BYTESCALE_PREFIX || '/payload-uploads',
            enabled: true,
            debug: process.env.NODE_ENV === 'development',
          }),
        ]
      : []),
  ],
  // Disable telemetry
  telemetry: false,
  // Disable onInit if not configured
  onInit: isPayloadEnabled 
    ? async (_payload) => {
        console.log('✅ Payload CMS initialized successfully')
        console.log(`📦 Database: PostgreSQL`)
        console.log(`🔗 Admin URL: ${process.env.PAYLOAD_SERVER_URL || 'http://localhost:3000'}/admin`)
        
        if (isBytescaleEnabled) {
          console.log('📤 Bytescale Upload Plugin: ENABLED')
          console.log(`   Account: ${process.env.BYTESCALE_ACCOUNT_ID}`)
        } else {
          console.log('📤 Bytescale Upload Plugin: DISABLED (using local storage)')
          console.log('   To enable, set BYTESCALE_API_KEY and BYTESCALE_ACCOUNT_ID in .env.local')
        }
      }
    : async (_payload) => {
        console.warn('⚠️  Payload CMS is not fully configured. Please set PAYLOAD_SECRET and PAYLOAD_DATABASE_URL in .env.local')
        console.warn('   See PAYLOAD_SETUP.md for configuration instructions.')
      }
})

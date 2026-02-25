import withBundleAnalyzer from "@next/bundle-analyzer"
import withVercelToolbar from "@vercel/toolbar/plugins/next"
import withPlugins from "next-compose-plugins"

/**
 * @type {import('next').NextConfig}
 */
const config = withPlugins([[withVercelToolbar(), withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })]], {
  reactStrictMode: true,
  serverExternalPackages: ["pg", "pg-connection-string"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 768, 1024, 1536],
    minimumCacheTTL: 31_556_926,
    // formats: ["image/avif", "image/webp"],
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "upcdn.io",
        port: "",
      }
    ],
  },
  rewrites() {
    return [
      { source: "/", destination: "/home" },
      { source: "/health", destination: "/api/health" },
      {
        source: "/search/:second",
        destination: "/search?second=:second",
      },
    ]
  },
  webpack: (config, { isServer, webpack }) => {
    // Fix for undici and File API in server environment
    if (isServer) {
      config.externals = config.externals || []
      // Don't externalize these packages that need polyfills
      config.resolve = config.resolve || {}
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }

      // CRITICAL: Ensure payload-polyfill.js loads FIRST
      // Add it as an entry point to ensure it runs before any other code
      config.plugins = config.plugins || []
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^undici$/,
          (_resource) => {
            // Ensure polyfill is loaded before undici
            if (!globalThis.File) {
              try {
                const path = require('path')
                require(path.resolve('./payload-polyfill.js'))
              } catch (e) {
                console.warn('Could not preload polyfill:', e)
              }
            }
          }
        )
      )
    }
    return config
  },
})

export default config

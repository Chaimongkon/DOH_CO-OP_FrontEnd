import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment variables
  env: {
    NEXT_DISABLE_WARN: 'true',
  },
  
  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 60 * 1000,
      pagesBufferLength: 5,
    },
    logging: {
      fetches: {
        fullUrl: false,
      },
    },
  }),
  
  // Image optimization - disabled for IIS deployment
  images: {
    unoptimized: true, // Disable for IIS compatibility
    ...(process.env.NODE_ENV === 'production' && {
      formats: ['image/webp', 'image/avif'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    }),
    ...(process.env.NODE_ENV === 'development' && {
      deviceSizes: [640, 1200],
      imageSizes: [32, 64, 128],
    }),
    domains: ['localhost', 'dohsaving.com', 'www.dohsaving.com'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3002',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.100.8',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dohsaving.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.dohsaving.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com', 
        pathname: '/**',
      }
    ],
  },

  // Experimental features
  experimental: {
    instrumentationHook: true,
    optimizePackageImports: ['antd', '@mui/material', '@mui/joy', 'lodash', 'date-fns'],
    esmExternals: true,
    serverComponentsExternalPackages: ['sharp', 'tesseract.js'],
    webVitalsAttribution: ['CLS', 'LCP'],
    ...(process.env.NODE_ENV === 'development' && {
      turbo: {
        memoryLimit: 1024,
        rules: {
          '*.svg': {
            loaders: ['@svgr/webpack'],
            as: '*.js',
          },
        },
        resolveAlias: {
          '@': './src',
        },
      },
    }),
  },
  
  // Compiler settings
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: true,
  },

  // Compression
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com data:; connect-src 'self' https: wss:; media-src 'self' https:; frame-src 'self' https://www.youtube.com https://youtube.com https://www.google.com https://google.com; object-src 'self' data: blob:; base-uri 'self'; form-action 'self';"
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ]
  },

  // URL rewrites for file serving
  async rewrites() {
    return [
      {
        source: '/PhotoAlbum/File/:path*',
        destination: '/api/files/PhotoAlbum/File/:path*'
      },
      {
        source: '/Slides/File/:path*',
        destination: '/api/files/Slides/File/:path*'
      },
      {
        source: '/News/File/:path*',
        destination: '/api/files/News/File/:path*'
      },
      {
        source: '/Dialog/File/:path*',
        destination: '/api/DialogBoxs/File/:path*'
      },
      {
        source: '/PhotosCover/File/:path*',
        destination: '/api/files/PhotosCover/File/:path*'
      },
      {
        source: '/PhotoAll/File/:path*',
        destination: '/api/files/PhotoAll/File/:path*'
      },
      {
        source: '/BusinessReport/File/:path*',
        destination: '/api/files/BusinessReport/File/:path*'
      },
      {
        source: '/Application/File/:path*',
        destination: '/api/files/Application/File/:path*'
      },
      {
        source: '/DownloadForm/File/:path*',
        destination: '/api/files/DownloadForm/File/:path*'
      },
      {
        source: '/Serve/File/:path*',
        destination: '/api/files/Serve/File/:path*'
      },
      {
        source: '/SRD/File/:path*',
        destination: '/api/files/SRD/File/:path*'
      },
      {
        source: '/ElectionDepartment/File/:path*',
        destination: '/api/files/ElectionDepartment/File/:path*'
      },
      {
        source: '/Organizational/File/:path*',
        destination: '/api/files/Organizational/File/:path*'
      },
      {
        source: '/SocietyCoop/File/:path*',
        destination: '/api/SocietyCoop/File/:path*'
      },
      {
        source: '/Particles/File/:path*',
        destination: '/api/files/Particles/File/:path*'
      },
      {
        source: '/Uploads/:path*',
        destination: '/api/Files/:path*'
      }
    ]
  },

  // Performance settings
  poweredByHeader: false,
  generateEtags: false,
  
  // Output for IIS deployment
  output: 'standalone',

  // Webpack configuration
  webpack: (config, {  dev, isServer }) => {
    // Fix crypto module resolution for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        fs: false,
        path: false,
        os: false
      };
    }
    // Development optimizations
    if (dev) {
      config.cache = {
        type: 'filesystem',
        allowCollectingMemory: true,
      };
      
      // Simplified splitting for faster dev builds
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
        },
      };
    }

    // Windows file system fixes
    if (process.platform === 'win32') {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }

    // Production bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        maxAsyncRequests: 25,
        cacheGroups: {
          antd: {
            name: 'antd',
            test: /[\\/]node_modules[\\/](antd|@ant-design)[\\/]/,
            priority: 30,
            chunks: 'all',
          },
          mui: {
            name: 'mui',
            test: /[\\/]node_modules[\\/](@mui)[\\/]/,
            priority: 30,
            chunks: 'all',
          },
          tesseract: {
            name: 'tesseract',
            test: /[\\/]node_modules[\\/](tesseract\.js)[\\/]/,
            priority: 25,
            chunks: 'async',
          },
          react: {
            name: 'react',
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            priority: 20,
            chunks: 'all',
          },
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'all',
            minChunks: 2,
          },
        },
      };
    }

    return config;
  },
};

// Sentry configuration - only in production
const sentryWebpackPluginOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: process.env.NODE_ENV === 'production',
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
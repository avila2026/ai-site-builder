import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig: NextConfig = {
  // Otimizações de produção
  poweredByHeader: false,
  compress: true,

  // React StrictMode apenas em dev (padrão)
  reactStrictMode: true,

  // Otimização de imagens
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },

  // Webpack optimizations (apenas produção)
  webpack: (config, { isServer }) => {
    // Reduzir bundle size em produção
    if (!isServer && process.env.NODE_ENV === 'production') {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 10,
            },
            framework: {
              name: 'framework',
              test: (module: any) =>
                module.resource &&
                module.resource.includes('node_modules') &&
                (module.resource.includes('react') ||
                 module.resource.includes('next') ||
                 module.resource.includes('framer-motion')),
              priority: 20,
            },
          },
        },
      };
    }
    return config;
  },

  // Headers de segurança e cache
  async headers() {
    return [
      {
        source: '/:all*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      // Cache agressivo para assets estáticos
      {
        source: '/:path*{/fonts,images,static}/:all*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache para assets do Next.js
      {
        source: '/_next/static/:all*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache moderado para páginas
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300, stale-while-revalidate=60' },
        ],
      },
    ];
  },
};

// Bundle Analyzer - apenas quando ANALYZE=true
const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withAnalyzer(nextConfig);

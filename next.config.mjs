import bundleAnalyzer from '@next/bundle-analyzer';
import { createMDX } from 'fumadocs-mdx/next';
import createNextIntlPlugin from 'next-intl/plugin';

const withMDX = createMDX();

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withNextIntl = createNextIntlPlugin({
  requestConfig: './src/core/i18n/request.ts',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  reactStrictMode: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
    ],
  },
  async redirects() {
    return [];
  },
  async headers() {
    const noIndexHeaders = [
      {
        key: 'X-Robots-Tag',
        value: 'noindex, nofollow',
      },
    ];

    return [
      // Admin
      { source: '/admin/:path*', headers: noIndexHeaders },
      { source: '/:locale(en|zh)/admin/:path*', headers: noIndexHeaders },

      // Settings
      { source: '/settings/:path*', headers: noIndexHeaders },
      { source: '/:locale(en|zh)/settings/:path*', headers: noIndexHeaders },

      // Activity
      { source: '/activity/:path*', headers: noIndexHeaders },
      { source: '/:locale(en|zh)/activity/:path*', headers: noIndexHeaders },

      // Chat
      { source: '/chat/:path*', headers: noIndexHeaders },
      { source: '/:locale(en|zh)/chat/:path*', headers: noIndexHeaders },

      // Auth
      { source: '/sign-in', headers: noIndexHeaders },
      { source: '/:locale(en|zh)/sign-in', headers: noIndexHeaders },
      { source: '/sign-up', headers: noIndexHeaders },
      { source: '/:locale(en|zh)/sign-up', headers: noIndexHeaders },
      { source: '/no-permission', headers: noIndexHeaders },
      { source: '/:locale(en|zh)/no-permission', headers: noIndexHeaders },
    ];
  },
  turbopack: {
    resolveAlias: {
      // fs: {
      //   browser: './empty.ts', // We recommend to fix code imports before using this method
      // },
    },
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
    // Disable mdxRs for Vercel deployment compatibility with fumadocs-mdx
    ...(process.env.VERCEL ? {} : { mdxRs: true }),
  },
  reactCompiler: true,
};

export default withBundleAnalyzer(withNextIntl(withMDX(nextConfig)));

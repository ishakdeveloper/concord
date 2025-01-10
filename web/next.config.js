/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  assetPrefix: process.env.NEXT_PUBLIC_URL,
  images: {
    unoptimized: true,
    domains: ['concord-web.fly.dev', 'staging.concord.fly.dev'],
  },
  experimental: {
    isrMemoryCacheSize: 0,
    serverActions: true,
  },
};

module.exports = nextConfig;

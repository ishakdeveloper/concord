/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  assetPrefix: process.env.NEXT_PUBLIC_URL,
  images: {
    unoptimized: true,
    domains: ['concord-web.fly.dev', 'staging.concord.fly.dev'],
  },
  reactStrictMode: true,
  swcMinify: true,
  staticPageGenerationTimeout: 0,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;

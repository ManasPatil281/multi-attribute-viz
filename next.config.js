/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // Remove static export for Lambda
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

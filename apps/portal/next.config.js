/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@sigizi/shared'],
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

module.exports = nextConfig;

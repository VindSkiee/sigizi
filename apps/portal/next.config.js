/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@sigizi/shared'],
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

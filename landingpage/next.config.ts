import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  port: 3001,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:3000/:path*',
      },
    ];
  },
};

export default nextConfig;

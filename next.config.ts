import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No 'standalone' output — Vercel handles bundling automatically
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

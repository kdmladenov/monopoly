import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "/Users/krasymladenov/Repo/monopoly"
  },
  devIndicators: true,
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: '/setup',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "/Users/krasymladenov/Repo/monopoly"
  },
  devIndicators: true,
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["api.backend.construction.code-studio4.com", "localhost"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

/* config options here */

export default nextConfig;

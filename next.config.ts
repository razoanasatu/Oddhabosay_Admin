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
  // Add this line to transpile @react-pdf/renderer and its dependencies
  transpilePackages: [
    "@react-pdf/renderer",
    "@react-pdf/font",
    "@react-pdf/text",
    "@react-pdf/view",
    "@react-pdf/page",
    "@react-pdf/document",
    "@react-pdf/image",
    "@react-pdf/primitives",
  ],
};

/* config options here */

export default nextConfig;

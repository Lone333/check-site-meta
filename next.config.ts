import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* config options here */
  output: 'standalone',
  // experimental: {
  //   ppr: true
  // }
};

export default nextConfig;

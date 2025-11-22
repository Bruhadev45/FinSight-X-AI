import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2gb',
    },
  },
};

export default nextConfig;
// Orchids restart: 1763035864317

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // ignores ESLint errors/warnings on Vercel builds
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure allowed image domains
  images: {
    domains: ['img.clerk.com'],
  },
  // Optional: Enable TypeScript strict mode
  typescript: {
    ignoreBuildErrors: true, // Set to true to bypass TypeScript errors during build
  },
  // Optional: Enable ESLint during build
  eslint: {
    ignoreDuringBuilds: false, // Set to true to bypass ESLint errors during build
  },
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.0.0.86"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;

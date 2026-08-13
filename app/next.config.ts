import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.69.135"],
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;

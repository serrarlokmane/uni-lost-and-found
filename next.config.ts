import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Small self-contained server for the Docker image (Sif's Dockerfile copies .next/standalone).
  output: "standalone",
  // Don't advertise the framework in every response.
  poweredByHeader: false,
};

export default nextConfig;

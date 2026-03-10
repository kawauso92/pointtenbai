import path from "node:path";
import type { NextConfig } from "next";

const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  experimental: {
    devtoolSegmentExplorer: false,
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;

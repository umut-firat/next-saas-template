import type { NextConfig } from "next";

import "./src/env.js";

const nextConfig: NextConfig = {
  experimental: {
    nodeMiddleware: true,
  },
};

export default nextConfig;

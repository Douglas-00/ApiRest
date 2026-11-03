import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image.
  output: "standalone",
  // The repo root also has a lockfile (the API); pin the app root to this folder.
  outputFileTracingRoot: process.cwd(),
  cacheComponents: true,
  images: { remotePatterns: [new URL("https://avatars.githubusercontent.com/**")] },
  partialPrefetching: true,
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

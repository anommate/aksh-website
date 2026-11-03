import type { NextConfig } from "next";

if (!process.env.NODE_OPTIONS?.includes("--max-old-space-size")) {
  process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ""} --max-old-space-size=4096`.trim();
}

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    agentUpgrade: "security",
  },
  async redirects() {
    return [
      // The AKSH Experience moved from its own page to a homepage section.
      // Temporary (307) so browsers do not cache it while the route plan settles.
      { source: "/experience", destination: "/#experience", permanent: false },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

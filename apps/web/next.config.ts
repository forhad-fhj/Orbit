import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          {
            // Required for Google OAuth popup postMessage back to parent window
            key: "Cross-Origin-Opener-Policy",
            value: "unsafe-none",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

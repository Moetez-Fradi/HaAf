import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Client-side configuration
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        path: require.resolve('path-browserify'),
      };
    }

    // Exclude hashconnect from server-side bundling
    if (isServer) {
      config.externals = [...(config.externals || []), 'hashconnect'];
    }

    return config;
  },
  // Enable loose ESM externals for better compatibility
  experimental: {
    esmExternals: 'loose'
  }
};

export default nextConfig;
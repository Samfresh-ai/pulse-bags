import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: '/app',
        destination: '/console',
        permanent: true, 
      },
    ];
  },
  turbopack: {
    root: process.cwd(),
  },
  webpack(config, { webpack }) {
    config.plugins = [
      ...(config.plugins ?? []),
      new webpack.IgnorePlugin({ resourceRegExp: /^@farcaster\/mini-app-solana$/ }),
    ];
    return config;
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Ensure server-side file system access works for briefing storage
  serverExternalPackages: [],
};

export default nextConfig;

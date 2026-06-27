/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';
const basePath = isDev ? '' : '/CropPred';

const nextConfig = {
  output: 'export',
  basePath: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  allowedDevOrigins: ["192.168.10.96", "localhost:3000"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

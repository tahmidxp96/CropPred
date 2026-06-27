/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/CropPred',
  env: {
    NEXT_PUBLIC_BASE_PATH: '/CropPred',
  },
  allowedDevOrigins: ["192.168.10.96", "localhost:3000"],
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
        },
      ],
      dangerouslyAllowSVG: true,
      unoptimized: true, // 這對於處理 blob URLs 很重要
    },
  }

export default nextConfig;

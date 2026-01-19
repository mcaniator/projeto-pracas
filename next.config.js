/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    reactCompiler: true,
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;

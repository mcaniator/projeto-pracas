/** @type {import('next').NextConfig} */
const isStaticExport = process.env.NEXT_OUTPUT_EXPORT === "true";

const nextConfig = {
  reactStrictMode: true,
  output: isStaticExport ? "export" : undefined,
  pageExtensions: isStaticExport ? ["tsx", "jsx"] : undefined,
  experimental: {
    reactCompiler: !isStaticExport,
    ...(isStaticExport ?
      {}
    : {
        serverActions: {
          bodySizeLimit: "2mb",
        },
      }),
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
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
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

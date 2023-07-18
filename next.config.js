/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  env: {
    BACKEND_URL: "http://44.202.51.43:5000",
  },
};

module.exports = nextConfig;

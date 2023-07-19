/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  env: {
    BACKEND_URL: "https://codecompiler.me",
  },
};

module.exports = nextConfig;

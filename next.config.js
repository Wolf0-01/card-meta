/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.duellinksmeta.com",
        pathname: "/cards/**",
      },
    ],
  },
};

module.exports = nextConfig;
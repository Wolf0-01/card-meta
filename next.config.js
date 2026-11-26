/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/cards/:id(\\d+).jpg",
        destination: "https://ygoprodeck.com",
      },
    ];
  },
};

module.exports = nextConfig;

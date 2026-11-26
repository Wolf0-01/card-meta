/** @type {import('next').NextConfig} */
const nextConfig = {
  a  async rewrites() {
    return [
      {
        source: "/cards/:id(\\d+).jpg",
        destination: "https://ygoprodeck.com",
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.duellinksmeta.com",
      },
      {
        protocol: "https",
        hostname: "imgserv.duellinksmeta.com",
      },
      {
        protocol: "https",
        hostname: "www.duellinksmeta.com",
      },
      {
        protocol: "https",
        hostname: "images.ygoprodeck.com",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "media.discordapp.net",
      },
    ],
  },
};

module.exports = nextConfig;
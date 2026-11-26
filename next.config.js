/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/news/guia-snake-eye-combos",
        destination: "/guides/snake-eye-combo-guide",
        permanent: false,
      },
      {
        source: "/news/guia-blue-eyes-cefiro",
        destination: "/guides/blue-eyes-zephyr-guide",
        permanent: false,
      },
      {
        source: "/news/guia-dark-magician-consistencia",
        destination: "/guides/dark-magician-consistency-guide",
        permanent: false,
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
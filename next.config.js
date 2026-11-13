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
        pathname: "/cards/**",
      },
    ],
  },
};

module.exports = nextConfig;
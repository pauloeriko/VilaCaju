import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // Redirections permanentes vers le domaine canonique vilacaju.com
  async redirects() {
    return [
      // vila-caju.com → vilacaju.com
      {
        source: "/:path*",
        has: [{ type: "host", value: "vila-caju.com" }],
        destination: "https://vilacaju.com/:path*",
        permanent: true,
      },
      // www.vila-caju.com → vilacaju.com
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.vila-caju.com" }],
        destination: "https://vilacaju.com/:path*",
        permanent: true,
      },
      // villa-caju.com → vilacaju.com (faute d'orthographe courante)
      {
        source: "/:path*",
        has: [{ type: "host", value: "villa-caju.com" }],
        destination: "https://vilacaju.com/:path*",
        permanent: true,
      },
      // www.villa-caju.com → vilacaju.com
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.villa-caju.com" }],
        destination: "https://vilacaju.com/:path*",
        permanent: true,
      },
      // www.vilacaju.com → vilacaju.com (suppression du www)
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.vilacaju.com" }],
        destination: "https://vilacaju.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

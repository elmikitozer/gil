import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a.storyblok.com",
      },
      // (facultatif) d'autres CDN Storyblok si tu en rencontres
      // { protocol: "https", hostname: "img2.storyblok.com" },
    ],
  },
};



export default nextConfig;


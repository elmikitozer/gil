// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // eslint: {
  //   ignoreDuringBuilds: true, // ✅ désactive le blocage ESLint sur Vercel
  // },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'a.storyblok.com' }, // images Storyblok
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Autorise l’intégration dans l’éditeur Storyblok (iframe)
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://app.storyblok.com https://m.storyblok.com;"
          },
          // Active uniquement si ton domaine est bien en HTTPS:
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

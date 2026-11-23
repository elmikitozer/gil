// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Domaine public des vidéos, figé au build et identique côté serveur et navigateur
  // (aperçu de l'éditeur) : lib/videos.ts y réécrit les anciens liens r2.dev.
  // Changer la variable impose donc un nouveau déploiement. Vide : aucune réécriture.
  env: {
    VIDEOS_PUBLIC_BASE_URL: process.env.VIDEOS_PUBLIC_BASE_URL ?? '',
  },
  // eslint: {
  //   ignoreDuringBuilds: true, // ✅ désactive le blocage ESLint sur Vercel
  // },
  images: {
    // Largeurs proposées par next/image (défaut Next, plus 1600, 2560 et 3200) : sans elles,
    // un écran Retina de 1440 px demandait 3840 px là où 2048 suffisent.
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920, 2048, 2560, 3200, 3840],
    remotePatterns: [
      { protocol: 'https', hostname: 'a.storyblok.com' }, // images Storyblok
    ],
  },
  async rewrites() {
    return {
      // L'éditeur visuel Storyblok charge « /?_storyblok=… » : on sert alors
      // l'aperçu du brouillon, sans rendre la home publique dynamique.
      beforeFiles: [
        {
          source: '/',
          has: [{ type: 'query', key: '_storyblok' }],
          destination: '/storyblok-preview',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      // Page d'envoi des vidéos et son API : jamais indexées.
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/api/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Autorise l’intégration dans l’éditeur Storyblok (iframe)
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://app.storyblok.com https://m.storyblok.com;",
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

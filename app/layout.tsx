import './globals.css';
import { Libre_Caslon_Text } from 'next/font/google';
import { Metadata, Viewport } from 'next';
import Navbar from './Navbar';
import CurrentYear from './components/CurrentYear';
import { SITE_URL } from '@/lib/site';

// Remplace la balise <meta name="viewport"> écrite à la main : même contenu
// (width=device-width, initial-scale=1, viewport-fit=cover), sans doublon.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// Données structurées (JSON-LD) : uniquement des faits déjà publiés sur le site
// (/information : photographe et réalisateur basé à Paris, e-mail ; lien Instagram du menu).
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'Gil Anselmi',
      inLanguage: 'en',
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: 'Gil Anselmi',
      url: `${SITE_URL}/`,
      jobTitle: 'Photographer and director',
      image: `${SITE_URL}/og.jpg`,
      email: 'mailto:contact@gilanselmi.com',
      homeLocation: { '@type': 'Place', name: 'Paris, France' },
      sameAs: ['https://www.instagram.com/gilanselmi'],
    },
  ],
};

export const metadata: Metadata = {
  title: 'Gil Anselmi — Photographer',
  description: 'Portfolio of Gil Anselmi — photographer & film.',
  metadataBase: new URL('https://gilanselmi.com'),
  // Empêche la traduction automatique par les navigateurs (noms de marques et de magazines :
  // « Issue 14 » ne doit pas devenir « Numéro 14 »). Va avec translate="no" sur <html>.
  other: { google: 'notranslate' },
  openGraph: {
    title: 'Gil Anselmi — Photographer',
    description: 'Portfolio of Gil Anselmi — photographer & film.',
    url: 'https://gilanselmi.com',
    siteName: 'Gil Anselmi',
    type: 'website',
    locale: 'en_US',
    // Dimensions réelles de public/og.jpg (1899×1200), image non recadrée.
    images: [{ url: '/og.jpg', width: 1899, height: 1200, alt: 'Gil Anselmi, photographer' }],
  },
  // Pas de canonical ni de robots ici : le canonical est défini page par page
  // (app/page.tsx, /information, /mentions-legales), sinon la 404 et toute
  // future page hériteraient de la home. Sans « robots », le défaut de Next
  // reste index/follow, et la 404 n'a plus de balises contradictoires.
};

const caslon = Libre_Caslon_Text({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-serif',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" translate="no" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://a.storyblok.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://a.storyblok.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
        {/* Largeur de la barre de défilement (0 avec les barres « overlay »), mesurée à l'apparition
            de la page et à chaque redimensionnement, pour que la grille pleine largeur (.full-bleed)
            ne dépasse pas de la fenêtre. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document.documentElement;function f(){var p=document.createElement('div');p.style.cssText='position:absolute;visibility:hidden;width:100vw;height:0';d.appendChild(p);var s=p.offsetWidth-d.clientWidth;d.removeChild(p);d.style.setProperty('--sbw',Math.max(0,s)+'px')}f();new ResizeObserver(f).observe(d)})()",
          }}
        />
      </head>

      <body
        className={`${caslon.variable} antialiased text-neutral-900 bg-bg text-fg`}
      >
        <Navbar />
        <main className="container mx-auto px-4 pb-12 pt-3">
          {children}
        </main>
        <footer className="border-t border-neutral-200 mt-16">
          <div className="container mx-auto px-4 py-6 text-sm text-neutral-500 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span>
              © <CurrentYear fallback={new Date().getFullYear()} /> Gil Anselmi. All rights reserved.
            </span>
            <a
              href="/mentions-legales"
              lang="fr"
              className="hover:text-neutral-700 transition-colors"
            >
              Mentions légales
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}

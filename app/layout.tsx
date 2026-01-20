import './globals.css';
import { Libre_Caslon_Text } from 'next/font/google';
import { Metadata } from 'next';
import Navbar from './Navbar';
import StoryblokBridgeLoader from './components/StoryblokBridgeLoader';
import StoryblokClientInit from './components/StoryblokClientInit';

export const metadata: Metadata = {
  title: 'Gil Anselmi — Photographer',
  description: 'Portfolio de Gil Anselmi — photographer & film.',
  metadataBase: new URL('https://gilanselmi.com'),
  openGraph: {
    title: 'Gil Anselmi — Photographer',
    description: 'Portfolio de Gil Anselmi — photographer & film.',
    url: 'https://gilanselmi.com',
    siteName: 'Gil Anselmi',
    images: [{ url: '/og.jpg', width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

const caslon = Libre_Caslon_Text({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-serif',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://a.storyblok.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://a.storyblok.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>

      <body
        className={`${caslon.variable} antialiased text-neutral-900 bg-bg text-fg dark:bg-darkbg dark:text-darkfg`}
      >
        <StoryblokClientInit />
        <Navbar />
        <main className="container mx-auto px-4 pb-12 pt-3">
          {children}
        </main>
        <StoryblokBridgeLoader />
        <footer className="border-t border-neutral-200 mt-16">
          <div className="container mx-auto px-4 py-6 text-sm text-neutral-500 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span>© {new Date().getFullYear()} Gil Anselmi. All rights reserved.</span>
            <a
              href="/mentions-legales"
              className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              Mentions légales
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}

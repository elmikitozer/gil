import './globals.css';
import { Libre_Caslon_Text } from 'next/font/google';
import { Metadata } from 'next';
import Navbar from './Navbar';
import StoryblokBridgeLoader from './components/StoryblokBridgeLoader';
import StoryblokClientInit from './components/StoryblokClientInit';

export const metadata: Metadata = {
  title: 'Gil Anselmi — Photographe',
  description: 'Portfolio de Gil Anselmi — photographie & film.',
  metadataBase: new URL('https://gilanselmi.com'),
  openGraph: {
    title: 'Gil Anselmi — Photographe',
    description: 'Portfolio de Gil Anselmi — photographie & film.',
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

      <body className={`${caslon.variable} antialiased text-neutral-900 bg-bg text-fg dark:bg-darkbg dark:text-darkfg`}>
        <StoryblokClientInit />
        <Navbar />
        <main
          className="container mx-auto px-4 pb-12 pt-[calc(64px+env(safe-area-inset-top))]"
        >
          {children}
        </main>
        <StoryblokBridgeLoader />
        <footer className="border-t border-neutral-200 mt-16">
          <div className="container mx-auto px-4 py-8 text-sm text-neutral-500">
            © {new Date().getFullYear()} Gil Anselmi
          </div>
        </footer>

      </body>
    </html>
  );
}

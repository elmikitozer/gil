// import './globals.css';
// import { ensureStoryblok } from "@/lib/storyblok";
import { Inter, Libre_Caslon_Text } from 'next/font/google';
import { Metadata } from 'next';
import Navbar from './Navbar';
// app/fonts/epilogue.ts
// import { Epilogue } from "next/font/google";
// export const epilogue = Epilogue({
//   subsets: ["latin"],
//   weight: ["400"],
//   variable: "--font-epilogue",
// });

// ensureStoryblok();

export const metadata: Metadata = {
  title: 'Gil Anselmi — Photographe',
  description: 'Portfolio de Gil Anselmi — photographie & film.',
  metadataBase: new URL('https://gilanselmi.com'), // ton domaine
  openGraph: {
    title: 'Gil Anselmi — Photographe',
    description: 'Portfolio de Gil Anselmi — photographie & film.',
    url: 'https://gilanselmi.com',
    siteName: 'Gil Anselmi',
    images: [{ url: '/og.jpg', width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const caslon = Libre_Caslon_Text({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-serif',
});

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="fr">
//       <body className={`${inter.variable} ${caslon.variable} antialiased`}>{children}</body>
//     </html>
//   );
// }


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">

      <head>
        <link rel="preconnect" href="https://a.storyblok.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://a.storyblok.com" />
      {/* <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const stored = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (stored === 'dark' || (!stored && prefersDark)) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          })()
        `,
      }}
    /> */}

      </head>

      <body className={`${caslon.variable} antialiased text-neutral-900 bg-bg text-fg dark:bg-darkbg dark:text-darkfg`}>
        <Navbar />
        <main className="container mx-auto px-4 pb-12 mt-2 md:mt-2">{children}</main>
        <footer className="border-t border-neutral-200 mt-16">
          <div className="container mx-auto px-4 py-8 text-sm text-neutral-500">
            © {new Date().getFullYear()} Gil Anselmi
          </div>
        </footer>
      </body>
    </html>
  );
}

'use client';

import Link from 'next/link';
import { bigCaslon } from '@/app/fonts/big-caslon';
import Image from 'next/image';

export default function Navbar() {
  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50',
        'bg-white/90 dark:bg-black backdrop-blur border-b border-neutral-900 dark:border-neutral-100',
        'transition-colors',
      ].join(' ')}
    >
      <div className="relative px-6 md:px-8 h-16 flex items-center">
        {/* LOGO animé à gauche — + padding-left pour le respir */}
        <div
          className="absolute inset-0 z-10 flex items-center [--pad:24px] md:[--pad:32px] pl-6 md:pl-8"
          aria-hidden="false"
        >
          <Link
            href="/"
            aria-label="Retour à l’accueil"
            className="hover:opacity-80 transition-opacity animate-slide-nav-bounce-basic-left"
          >
            <Image
              src="/logofi.png" // ton fichier logo dans /public/logo.png
              alt="Logo Gil Anselmi"
              width={190} // adapte la taille
              height={120}
              priority // pour charger vite le logo
              className="w-[120px] md:w-[160px] lg:w-[190px] h-auto"
              sizes="(max-width: 640px) 120px, (max-width: 1024px) 160px, 190px"
            />
          </Link>
        </div>

        {/* NAV à droite (cliquable) */}
        <nav className="relative z-20 ml-auto flex items-center gap-4 text-[9px] sm:text-[11px] md:text-[12px] tracking-[0.22em] uppercase text-neutral-900 dark:text-neutral-100">
          <Link
            href="/information"
            className={`${bigCaslon.className} hover:opacity-70 transition-opacity`}
          >
            Information
          </Link>
          <a
            href="https://www.instagram.com/gilanselmi"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className={`${bigCaslon.className} hover:opacity-70 transition-opacity`}
          >
            Instagram
          </a>
        </nav>
      </div>
    </header>
  );
}

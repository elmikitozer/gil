'use client';

import Link from 'next/link';
// import { usePathname } from "next/navigation";
// import { useEffect, useState } from "react";
import { bigCaslon } from '@/app/fonts/big-caslon';
import Image from 'next/image';
// import ThemeToggle from './components/ui/ThemeToogle';

export default function Navbar() {
  // const pathname = usePathname();
  // const [scrolled, setScrolled] = useState(false);
  // scrolled; // pour forcer le re-render

  // useEffect(() => {
  //   const onScroll = () => setScrolled(window.scrollY > 8);
  //   onScroll();
  //   window.addEventListener("scroll", onScroll, { passive: true });
  //   return () => window.removeEventListener("scroll", onScroll);
  // }, []);

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
          {/* <Link
            href="/"
            aria-label="Retour à l’accueil"
              className={`${bigCaslon.className} whitespace-nowrap font-medium leading-[1]  dark:text-neutral-100
              text-[clamp(20px,3.2vw,40px)] hover:opacity-80 transition-opacity
              animate-slide-nav-bounce-basic-left`}

            // style={{ fontFamily: "var(--font-custom-73554, Inter, system-ui, sans-serif)" }}
          > */}
          {/* Gil&nbsp;Anselmi
          </Link> */}
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
              className="h-auto w-[120px] md:w-[160px] lg:w-[190px]" // tailles adaptatives
              sizes="(max-width: 640px) 120px, (max-width: 1024px) 160px, 190px"
              // style={{ height: "auto", width: "auto" }}
            />
          </Link>
        </div>

        {/* NAV à droite (cliquable) */}
        <nav className="relative z-20 ml-auto flex items-center gap-6 text-[11px] md:text-[12px] tracking-[0.22em] uppercase text-neutral-900 dark:text-neutral-100">
          <Link
            href="/informations"
            className={`${bigCaslon.className}transition-opacity hover:opacity-70 `}
          >
            Informations
          </Link>

          {/* Icône Instagram cliquable (remplace le texte) */}
          <a
            href="https://www.instagram.com/gilanselmi"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="transition-opacity hover:opacity-70 inline-flex items-center"
          >
            {' '}
            Instagram
          </a>
          {/* <ThemeToggle /> */}
        </nav>
      </div>
    </header>
  );
}

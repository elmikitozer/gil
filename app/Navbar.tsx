"use client";

import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useEffect, useState } from "react";
import { bigCaslon } from "@/app/fonts/big-caslon";



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
        "fixed inset-x-0 top-0 z-50",
        "bg-white/90 backdrop-blur border-b border-neutral-200",
        "transition-colors"
      ].join(" ")}
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
              className={`${bigCaslon.className} whitespace-nowrap font-normal leading-[1] text-neutral-900
              text-[clamp(20px,3.2vw,40px)] hover:opacity-80 transition-opacity
              animate-slide-nav-bounce-basic-left`}

            // style={{ fontFamily: "var(--font-custom-73554, Inter, system-ui, sans-serif)" }}
          >
            GIL&nbsp;ANSELMI
          </Link>
        </div>

        {/* NAV à droite (cliquable) */}
        <nav className="relative z-20 ml-auto flex items-center gap-6 text-[11px] md:text-[12px] tracking-[0.22em] uppercase text-neutral-900">
          <Link href="/contact" className="transition-opacity hover:opacity-70">
            Contact
          </Link>

          {/* Icône Instagram cliquable (remplace le texte) */}
          <a
            href="https://www.instagram.com/gilanselmi"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="transition-opacity hover:opacity-70 inline-flex items-center"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="currentColor"
            >
              <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM18 6.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
          </a>
        </nav>
      </div>
    </header>
  );
}

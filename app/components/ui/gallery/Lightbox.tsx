"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useGallery } from "./GalleryContext";
import type { Item } from "./GalleryContext";
import { LightboxNav } from "./LightboxNav";

export default function Lightbox() {
  const { isOpen, close, items, index, next, prev } = useGallery();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !isOpen) return null;

  // Typage explicite : pas de `any`
  const it: Item | undefined = items[index];

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-white dark:bg-black flex items-center justify-center p-0 lb-anim-fade" role="dialog" aria-modal="true">
      <div className="absolute inset-0 grid place-items-center">
        {it?.kind === "image" ? (
          <div className="relative h-[90vh] w-[90vw]">
            <Image
              src={it.src}
              alt={it.alt ?? ""}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </div>
        ) : it?.kind === "video" ? (
          <div className="relative h-[90vh] w-[90vw]">
            <video
              className="h-full w-full object-contain"
              controls
              playsInline
              muted
              loop
              poster={it.poster ?? undefined}
            >
              {it.srcWebm ? <source src={it.srcWebm} type="video/webm" /> : null}
              <source src={it.srcMp4} type="video/mp4" />
            </video>
          </div>
        ) : null}
      </div>

      {/* Close en haut à droite (tes classes) */}
      <button
        type="button"
        aria-label="Fermer"
        title="Fermer"
        onClick={close}
        className="lb-close text-neutral-900 dark:text-white"
      >
        <svg viewBox="0 0 24 24" className="lb-close__icon" aria-hidden="true">
          <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Flèches visibles + clavier + swipe (zones 1/3 supprimées de ton LightboxNav) */}
      <LightboxNav onNext={next} onPrev={prev} />
    </div>,
    document.body
  );
}

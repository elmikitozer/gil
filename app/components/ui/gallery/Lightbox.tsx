"use client";

import { createPortal } from "react-dom";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useGallery } from "./GalleryContext";
import { LightboxNav } from "./LightboxNav";

export default function Lightbox() {
  const { isOpen, close, items, index, next, prev } = useGallery();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const it = items[index];

  if (!mounted || !isOpen) return null;

  const node = (
    <div className="fixed inset-0 z-[60] bg-white lb-anim-bg">
      <div className="absolute inset-0 grid place-items-center">
        {it?.kind === "image" ? (
          <div className="relative h-[90vh] w-[90vw] lb-anim-media">
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
          <div className="relative h-[90vh] w-[90vw] lb-anim-media">
            <video
              className="h-full w-full object-contain"
              controls
              playsInline
              muted
              loop
              poster={it.poster}
            >
              {it.srcWebm ? (
                <source src={it.srcWebm} type="video/webm" />
              ) : null}
              <source src={it.srcMp4} type="video/mp4" />
            </video>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        aria-label="Fermer"
        title="Fermer"
        onClick={close}
        className="lb-close"
      >

    
        <svg viewBox="0 0 24 24" className="lb-close__icon" aria-hidden="true">
          <path
            d="M6 6L18 18M6 18L18 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <LightboxNav onNext={next} onPrev={prev} />
    </div>
  );

  return createPortal(node, document.body);
}

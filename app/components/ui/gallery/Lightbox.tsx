'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useGallery } from './GalleryContext';
import type { Item } from './GalleryContext';
import { LightboxNav } from './LightboxNav';
import { extractVimeoId } from '@/app/utils/vimeo';

export default function Lightbox() {
  const { isOpen, close, items, index, next, prev } = useGallery();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !isOpen) return null;

  // Typage explicite : pas de `any`
  const it: Item | undefined = items[index];

  return createPortal(
    <div
      className="fixed inset-0 z-[60] bg-white dark:bg-black flex items-center justify-center p-0 lb-anim-fade"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 grid place-items-center">
        {it?.kind === 'image' ? (
          <div className="relative h-[90vh] w-[90vw]">
            <Image
              src={it.src}
              alt={it.alt ?? ''}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </div>
        ) : it?.kind === 'video' ? (
          <div className="relative h-[90vh] w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <video
              key={it.srcMp4} // Force re-render when video changes
              className="h-full w-full object-contain"
              controls
              autoPlay
              playsInline
              muted={false}
              loop
              preload="auto"
              poster={it.poster ?? undefined}
              onError={(e) => {
                console.error('Erreur vidéo lightbox:', e);
                console.error('srcMp4:', it.srcMp4);
                console.error('srcWebm:', it.srcWebm);
                console.error('Erreur détails:', e.currentTarget.error);
              }}
              onLoadedMetadata={() => console.log('Lightbox: Metadata chargée')}
              onCanPlay={() => console.log('Lightbox: Prête à jouer')}
              onPlay={() => console.log('Lightbox: Lecture démarrée')}
            >
              {it.srcWebm ? <source src={it.srcWebm} type="video/webm" /> : null}
              <source src={it.srcMp4} type="video/mp4" />
            </video>
          </div>
        ) : it?.kind === 'hybrid' ? (
          // HYBRIDE : Affiche la vidéo Vimeo complète dans la lightbox
          (() => {
            const vimeoId = extractVimeoId(it.vimeoId);
            return vimeoId ? (
              <div className="relative h-[min(90vh,50.625vw)] w-[min(90vw,160vh)]">
                <iframe
                  key={vimeoId}
                  src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&title=0&byline=0&portrait=0`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={it.title || 'Vidéo complète'}
                />
              </div>
            ) : (
              // Fallback : afficher le MP4 si vimeoId invalide
              <div className="relative h-[90vh] w-[90vw]" onClick={(e) => e.stopPropagation()}>
                <video
                  key={it.srcMp4}
                  className="h-full w-full object-contain"
                  controls
                  autoPlay
                  playsInline
                  muted={false}
                  loop
                  preload="auto"
                >
                  <source src={it.srcMp4} type="video/mp4" />
                </video>
              </div>
            );
          })()
        ) : it?.kind === 'vimeo' ? (
          (() => {
            const vimeoId = extractVimeoId(it.vimeoId);
            return vimeoId ? (
              <div className="relative h-[min(90vh,50.625vw)] w-[min(90vw,160vh)]">
                <iframe
                  key={vimeoId}
                  src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&title=0&byline=0&portrait=0`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={it.title || 'Vidéo Vimeo'}
                />
              </div>
            ) : null;
          })()
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
          <path
            d="M6 6L18 18M6 18L18 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Flèches visibles + clavier + swipe (zones 1/3 supprimées de ton LightboxNav) */}
      <LightboxNav onNext={next} onPrev={prev} />
    </div>,
    document.body
  );
}

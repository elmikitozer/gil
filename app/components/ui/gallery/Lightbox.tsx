'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useGallery } from './GalleryContext';
import type { Item } from './GalleryContext';
import { LightboxNav } from './LightboxNav';
import { extractVimeoId } from '@/app/utils/vimeo';

export default function Lightbox() {
  const { isOpen, close, items, index, next, prev, openAt } = useGallery();
  const [mounted, setMounted] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [disableTransition, setDisableTransition] = useState(false);
  const startX = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const lastX = useRef<number | null>(null);
  const incomingFrom = useRef<number | null>(null);
  const [neighborIndex, setNeighborIndex] = useState<number | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1000
  );
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as Window & { __LB_DISABLE_SWIPE?: boolean }).__LB_DISABLE_SWIPE = true;
    }
    return () => {
      if (typeof window !== 'undefined') {
        (window as Window & { __LB_DISABLE_SWIPE?: boolean }).__LB_DISABLE_SWIPE = false;
      }
    };
  }, []);
  useEffect(() => {
    const onResize = () =>
      setViewportWidth(typeof window !== 'undefined' ? window.innerWidth : 1000);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // After index changes (next/prev), if we swiped, animate the new media from the opposite side
  useEffect(() => {
    if (!mounted) return;
    if (incomingFrom.current == null) return;
    const dir = incomingFrom.current; // 1 if previous, -1 if next
    const width = typeof window !== 'undefined' ? window.innerWidth : 1000;
    // Place new media just off-screen on the opposite side, without transition
    setDisableTransition(true);
    setDragX(-dir * width);
    requestAnimationFrame(() => {
      // Re-enable transition and slide into place
      setDisableTransition(false);
      requestAnimationFrame(() => {
        setDragX(0);
        incomingFrom.current = null;
      });
    });
  }, [index, mounted]);

  if (!mounted || !isOpen) return null;

  // Typage explicite : pas de `any`
  const it: Item | undefined = items[index];

  return createPortal(
    <div
      className="fixed inset-0 z-[60] bg-white dark:bg-black flex flex-col p-0 lb-anim-fade"
      role="dialog"
      aria-modal="true"
    >
      {/* Contenu principal */}
      <div
        className="flex-1 flex items-center justify-center relative pb-20"
        onPointerDown={(e) => {
          // Only start dragging with the primary pointer (touch/mouse), not pen/others
          if (e.pointerType && e.pointerType !== 'touch' && e.pointerType !== 'mouse') return;
          const target = e.target as HTMLElement;
          if (target.closest('video, iframe')) return;
          setIsDragging(true);
          startX.current = e.clientX;
          lastX.current = e.clientX;
          startTime.current = e.timeStamp;
        }}
        onPointerMove={(e) => {
          if (!isDragging || startX.current == null) return;
          const dx = e.clientX - startX.current;
          setDragX(dx);
          lastX.current = e.clientX;
          const dir = dx < 0 ? 1 : -1; // 1 => next, -1 => prev
          const candidate = index + dir;
          if (candidate >= 0 && candidate < items.length) {
            setNeighborIndex(candidate);
          } else {
            setNeighborIndex(null);
          }
        }}
        onPointerUp={(e) => {
          if (!isDragging || startX.current == null || lastX.current == null) return;
          const dx = lastX.current - startX.current;
          const dt = startTime.current != null ? e.timeStamp - startTime.current : 1;
          const velocity = dx / Math.max(dt, 1); // px per ms
          const THRESHOLD = 64;
          const VELOCITY_MIN = 0.5; // px/ms
          const shouldSwipe = Math.abs(dx) > THRESHOLD || Math.abs(velocity) > VELOCITY_MIN;
          setIsDragging(false);
          if (shouldSwipe) {
            const direction = dx > 0 ? 1 : -1; // 1 => go prev, -1 => go next
            const candidate = index - direction;
            if (candidate >= 0 && candidate < items.length) setNeighborIndex(candidate);
            setDragX(direction * viewportWidth);
            setTimeout(() => {
              if (direction > 0) {
                prev();
              } else {
                next();
              }
              setDisableTransition(true);
              setDragX(0);
              requestAnimationFrame(() => {
                setNeighborIndex(null);
                setDisableTransition(false);
              });
            }, 180);
          } else {
            setDragX(0);
            setNeighborIndex(null);
          }
          startX.current = null;
          lastX.current = null;
          startTime.current = null;
        }}
        onPointerCancel={() => {
          setIsDragging(false);
          setDragX(0);
          startX.current = null;
          lastX.current = null;
          startTime.current = null;
        }}
      >
        <div
          className="relative h-full w-full"
          style={{
            transform: `translateX(${dragX}px)`,
            transition:
              isDragging || disableTransition
                ? 'none'
                : 'transform 180ms cubic-bezier(0.4,0.8,0.4,1)',
            willChange: 'transform',
            touchAction: 'pan-y',
          }}
        >
          {it?.kind === 'image' ? (
            <div className="relative h-full w-full md:h-[90vh] md:w-[90vw]">
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
            <div className="relative h-full w-full md:h-[90vh] md:w-[90vw]">
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
                  if (process.env.NODE_ENV === 'development') {
                    console.error('Erreur vidéo lightbox:', it.srcMp4, e);
                  }
                }}
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
                <div className="relative h-full w-full md:h-[90vh] md:w-[90vw]">
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

          {neighborIndex != null ? (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                transform: `translateX(${dragX < 0 ? viewportWidth : -viewportWidth}px)`,
                transition:
                  isDragging || disableTransition
                    ? 'none'
                    : 'transform 180ms cubic-bezier(0.4,0.8,0.4,1)',
                willChange: 'transform',
              }}
            >
              {(() => {
                const nit: Item | undefined = items[neighborIndex];
                if (!nit) return null;
                if (nit.kind === 'image') {
                  return (
                    <div className="relative h-full w-full md:h-[90vh] md:w-[90vw]">
                      <Image
                        src={nit.src}
                        alt={nit.alt ?? ''}
                        fill
                        sizes="90vw"
                        className="object-contain"
                        priority
                      />
                    </div>
                  );
                }
                if (nit.kind === 'video' || nit.kind === 'hybrid') {
                  return (
                    <div className="relative h-full w-full md:h-[90vh] md:w-[90vw]">
                      <div className="h-full w-full bg-black/60 flex items-center justify-center text-white/70 text-sm">
                        {nit.title ?? 'Media'}
                      </div>
                    </div>
                  );
                }
                if (nit.kind === 'vimeo') {
                  return (
                    <div className="relative h-[min(90vh,50.625vw)] w-[min(90vw,160vh)]">
                      <div className="h-full w-full bg-black/60 flex items-center justify-center text-white/70 text-sm">
                        Vimeo
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          ) : null}
        </div>
      </div>

      {/* Miniatures en mode carrousel */}
      {items.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center py-4 bg-transparent h-24">
          <div className="flex gap-2 max-w-full overflow-x-auto">
            {items.map((item, i) => (
              <button
                key={`${i}-${item.kind}-${'src' in item ? item.src : item.title ?? 'no-src'}`}
                type="button"
                onClick={() => openAt(i)}
                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                  i === index
                    ? 'border-white scale-110'
                    : 'border-transparent hover:border-white/50'
                }`}
              >
                {item.kind === 'image' ? (
                  <Image
                    src={item.src}
                    alt={item.alt ?? ''}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : item.kind === 'video' || item.kind === 'hybrid' ? (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                ) : item.kind === 'vimeo' ? (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      )}

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

      {/* Flèches visibles + clavier */}
      <LightboxNav
        onNext={() => {
          const candidate = index + 1;
          if (candidate >= items.length) return;
          setNeighborIndex(candidate);
          setDragX(-viewportWidth);
          setTimeout(() => {
            next();
            setDisableTransition(true);
            setDragX(0);
            requestAnimationFrame(() => {
              setNeighborIndex(null);
              setDisableTransition(false);
            });
          }, 180);
        }}
        onPrev={() => {
          const candidate = index - 1;
          if (candidate < 0) return;
          setNeighborIndex(candidate);
          setDragX(viewportWidth);
          setTimeout(() => {
            prev();
            setDisableTransition(true);
            setDragX(0);
            requestAnimationFrame(() => {
              setNeighborIndex(null);
              setDisableTransition(false);
            });
          }, 180);
        }}
      />
    </div>,
    document.body
  );
}

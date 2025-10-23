'use client';

import LightboxClose from './ui/LightboxClose';

import { useEffect, useState, useCallback, useRef } from 'react';
import HoverCover from '@/app/components/ui/HoverCover';
import useIsStoryblokEditor from './useIsStoryblokEditor';

type Props = {
  srcMp4: string;
  srcWebm?: string;
  poster?: string;
  width: number;
  height: number;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  onLoaded?: (videoW: number, videoH: number) => void;
  onOpen?: () => void;
  autoplayInViewport?: boolean;
  hoverTitle?: string; // ✅
  hoverCaption?: string; // ✅
};

export default function ZoomableVideo({
  srcMp4,
  srcWebm,
  poster,
  width,
  height,
  autoPlay = false,
  loop = true,
  muted = true,
  onLoaded,
  onOpen,
  autoplayInViewport = true,
  hoverTitle,
  hoverCaption,
}: Props) {
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const isStoryblokEditor = useIsStoryblokEditor();

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => {
      if (v.videoWidth && v.videoHeight) onLoaded?.(v.videoWidth, v.videoHeight);
    };
    v.addEventListener('loadedmetadata', onMeta);
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, [onLoaded]);

  useEffect(() => {
    if (!autoplayInViewport) return;
    const v = videoRef.current;
    const el = btnRef.current;
    if (!v || !el) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.5) {
            // Charger la vidéo si pas déjà fait
            if (v.readyState === 0) {
              v.load();
            }
            // Petit délai pour éviter de surcharger
            setTimeout(() => {
              v.play().catch(() => {});
            }, 100);
          } else {
            v.pause();
          }
        }
      },
      {
        threshold: [0, 0.5],
        rootMargin: '100px', // Pré-charge plus tôt
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [autoplayInViewport]);

  const onClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          // Ne pas ouvrir la lightbox dans l'éditeur Storyblok
          if (isStoryblokEditor) return;
          if (onOpen) {
            onOpen();
          } else {
            setOpen(true);
          }
        }}
        className="group relative block w-full focus:outline-none cursor-pointer"
        style={{ width, height, lineHeight: 0 }}
      >
        <video
          ref={videoRef}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          {srcWebm && <source src={srcWebm} type="video/webm" />}
          <source src={srcMp4} type="video/mp4" />
        </video>

        {/* Label hover */}
        <HoverCover text={hoverTitle} caption={hoverCaption} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-0 cursor-pointer"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <LightboxClose onClick={onClose} size="lg" />
          <video
            key={srcMp4} // Force re-render when video changes
            poster={poster}
            autoPlay
            loop
            muted={false}
            controls
            playsInline
            preload="auto"
            className="w-[min(100vw,90vh)] max-h-[90vh] object-contain"
            onError={(e) => {
              // Erreur silencieuse en production
              if (process.env.NODE_ENV === 'development') {
                console.error('Erreur vidéo:', srcMp4, e);
              }
            }}
          >
            {srcWebm && <source src={srcWebm} type="video/webm" />}
            <source src={srcMp4} type="video/mp4" />
          </video>
        </div>
      )}
    </>
  );
}

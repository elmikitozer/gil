'use client';

import { useEffect, useRef, useState } from 'react';
import HoverCover from '@/app/components/ui/HoverCover';
import useIsStoryblokEditor from './useIsStoryblokEditor';

/** Durée de visibilité (à plus de 50 %) avant de charger et lancer la vidéo. */
const VISIBLE_DELAY_MS = 300;

type Props = {
  srcMp4: string;
  srcWebm?: string;
  poster?: string;
  width: number | string;
  height: number | string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  onLoaded?: (videoW: number, videoH: number) => void;
  onOpen: () => void;
  autoplayInViewport?: boolean;
  /** Nom du bouton pour les lecteurs d'écran (texte alternatif ou titre de la vidéo). */
  label?: string;
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
  label,
  hoverTitle,
  hoverCaption,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const isStoryblokEditor = useIsStoryblokEditor();
  // Affiche posée seulement quand la vignette est à l'écran ou à moins d'un écran :
  // le navigateur télécharge l'affiche de toute <video> qui en porte une, même hors écran.
  const [posterSrc, setPosterSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    const el = btnRef.current;
    if (!poster || !el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPosterSrc(poster);
          io.disconnect();
        }
      },
      { rootMargin: '100% 0px', threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [poster]);

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

    // Chargement seulement après VISIBLE_DELAY_MS à plus de 50 % à l'écran :
    // une vignette traversée pendant un défilement rapide ne télécharge rien.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.5) {
            if (timer) continue;
            timer = setTimeout(() => {
              timer = undefined;
              if (v.readyState === 0) v.load();
              v.play().catch(() => {});
            }, VISIBLE_DELAY_MS);
          } else {
            if (timer) clearTimeout(timer);
            timer = undefined;
            v.pause();
          }
        }
      },
      {
        threshold: [0, 0.5],
        rootMargin: '100px',
      }
    );

    io.observe(el);
    return () => {
      if (timer) clearTimeout(timer);
      io.disconnect();
    };
  }, [autoplayInViewport]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label || 'Open video'}
        onClick={() => {
          // Ne pas ouvrir la lightbox dans l'éditeur Storyblok
          if (isStoryblokEditor) return;
          onOpen();
        }}
        className="group relative block w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 cursor-pointer"
        style={{ width, height, lineHeight: 0 }}
      >
        <video
          ref={videoRef}
          poster={posterSrc}
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
    </>
  );
}

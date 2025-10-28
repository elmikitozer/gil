'use client';

import { useEffect, useState, useCallback } from 'react';
import useIsStoryblokEditor from '@/app/components/useIsStoryblokEditor';
import HoverCover from '@/app/components/ui/HoverCover';
import Image from 'next/image';
import LightboxClose from './ui/LightboxClose';
import type { ImageItem } from './ui/gallery/GalleryContext';

type Props = {
  src: string;
  alt?: string;
  thumbWidth?: number;
  thumbHeight?: number;
  sizes?: string;
  onLoaded?: (w: number, h: number) => void;
  onOpen?: () => void;
  hoverTitle?: string;
  hoverCaption?: string;
  // Props pour le mode album
  albumPhotos?: ImageItem[];
  isCoverPhoto?: boolean;
  onOpenAlbum?: (index: number) => void;
};

export default function ZoomableImage({
  src,
  alt = '',
  thumbWidth = 1600,
  thumbHeight = 1200,
  sizes,
  onLoaded,
  onOpen,
  hoverTitle,
  hoverCaption,
  albumPhotos,
  onOpenAlbum,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pressed, setPressed] = useState(false);
  const onClose = useCallback(() => setOpen(false), []);
  const isEditor = useIsStoryblokEditor();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    // document.addEventListener("keydown", onKey);
    window.addEventListener('keydown', onKey, { passive: true });
    document.body.style.overflow = 'hidden';
    return () => {
      // document.removeEventListener("keydown", onKey);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleClick = (e: React.MouseEvent) => {
    // En mode Visual Editor, on laisse le clic SERVIR à sélectionner l'élément dans Storyblok
    // -> ne pas preventDefault / stopPropagation pour que l'événement remonte jusqu'au parent
    // Astuce: meta/ctrl/shift-click autorise quand même l'ouverture locale si besoin
    if (isEditor && !(e.metaKey || e.ctrlKey || e.shiftKey)) return;

    setPressed(true);
    setTimeout(() => {
      // Si on a des photos d'album et une fonction d'ouverture d'album, ouvrir en mode carrousel
      if (albumPhotos && albumPhotos.length > 0 && onOpenAlbum) {
        // Trouver l'index de cette photo dans l'album
        const currentIndex = albumPhotos.findIndex((photo) => photo.src === src);
        if (currentIndex !== -1) {
          onOpenAlbum(currentIndex);
        }
      } else if (onOpen) {
        onOpen();
      } else {
        setOpen(true);
      }
      setPressed(false);
    }, 90);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`group relative block w-full focus:outline-none pressable ${
          pressed ? 'is-pressed' : ''
        } ${isEditor ? 'pointer-events-none' : 'cursor-pointer'}`}
        style={{ width: thumbWidth, height: thumbHeight, lineHeight: 0 }}
      >
        <div className="absolute inset-0 z-0">
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes || `${thumbWidth}px`}
            className="object-cover z-0"
            loading="lazy"
            onLoad={(event) => {
              const img = event.currentTarget;
              onLoaded?.(img.naturalWidth, img.naturalHeight);
            }}
          />
        </div>

        {/* Label hover (haut-gauche, slide-in) — ne doit pas intercepter les clics */}
        <div className="pointer-events-none">
          <HoverCover text={hoverTitle} caption={hoverCaption} />
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-0 cursor-pointer lb-anim-bg"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <LightboxClose onClick={() => onClose()} />
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain lb-anim-media"
            sizes="100vw"
            priority
          />
        </div>
      )}
    </>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import HoverCover from '@/app/components/ui/HoverCover';
import LightboxClose from './ui/LightboxClose';
import { extractVimeoId } from '@/app/utils/vimeo';
import useIsStoryblokEditor from './useIsStoryblokEditor';

type Props = {
  vimeoId: string;
  width: number;
  height: number;
  onOpen?: () => void;
  hoverTitle?: string;
  hoverCaption?: string;
};

export default function ZoomableVimeo({
  vimeoId,
  width,
  height,
  onOpen,
  hoverTitle,
  hoverCaption,
}: Props) {
  const [open, setOpen] = useState(false);
  const isStoryblokEditor = useIsStoryblokEditor();

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

  const cleanVimeoId = extractVimeoId(vimeoId);
  const thumbnailUrl = cleanVimeoId ? `https://vumbnail.com/${cleanVimeoId}.jpg` : '';

  if (!cleanVimeoId) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ID Vimeo invalide:', vimeoId);
    }
    return null;
  }

  return (
    <>
      <button
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
        className="group relative block w-full focus:outline-none cursor-pointer overflow-hidden"
        style={{ width, height, lineHeight: 0 }}
      >
        {/* Thumbnail avec lazy loading */}
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt="Vimeo thumbnail"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all">
          <svg
            className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        {/* Label hover */}
        <HoverCover text={hoverTitle} caption={hoverCaption} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-white dark:bg-black flex items-center justify-center p-0 cursor-pointer"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <LightboxClose onClick={onClose} size="lg" />
          <div
            className="w-[min(90vw,160vh)] h-[min(90vh,50.625vw)]"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://player.vimeo.com/video/${cleanVimeoId}?autoplay=1&loop=1&title=0&byline=0&portrait=0`}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={hoverTitle || 'Vidéo'}
            />
          </div>
        </div>
      )}
    </>
  );
}

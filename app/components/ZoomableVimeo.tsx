'use client';

import { useCallback, useEffect, useState } from 'react';
import HoverCover from '@/app/components/ui/HoverCover';
import LightboxClose from './ui/LightboxClose';

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
        type="button"
        onClick={() => (onOpen ? onOpen() : setOpen(true))}
        className="group relative block w-full focus:outline-none cursor-pointer overflow-hidden"
        style={{ width, height, lineHeight: 0 }}
      >
        {/* Iframe Vimeo en autoplay muted loop (comme vidéo locale) */}
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?background=1&autoplay=1&loop=1&muted=1&title=0&byline=0&portrait=0`}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          frameBorder="0"
          allow="autoplay; muted"
          title={hoverTitle || 'Vidéo Vimeo'}
        />

        {/* Layer cliquable transparent par-dessus la vidéo */}
        <div className="absolute inset-0 z-10" />

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
              src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`}
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

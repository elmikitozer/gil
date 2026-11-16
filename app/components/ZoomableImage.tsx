'use client';

import { useState } from 'react';
import useIsStoryblokEditor from '@/app/components/useIsStoryblokEditor';
import HoverCover from '@/app/components/ui/HoverCover';
import Image from 'next/image';

type Props = {
  src: string;
  alt?: string;
  thumbWidth?: number | string;
  thumbHeight?: number | string;
  sizes?: string;
  /** Image visible dès l'ouverture de la page : chargée sans attendre. */
  priority?: boolean;
  onLoaded?: (w: number, h: number) => void;
  onOpen?: () => void;
  hoverTitle?: string;
  hoverCaption?: string;
};

export default function ZoomableImage({
  src,
  alt = '',
  thumbWidth = 1600,
  thumbHeight = 1200,
  sizes,
  priority = false,
  onLoaded,
  onOpen,
  hoverTitle,
  hoverCaption,
}: Props) {
  const [pressed, setPressed] = useState(false);
  const isEditor = useIsStoryblokEditor();

  const handleClick = (e: React.MouseEvent) => {
    // En mode Visual Editor, on laisse le clic SERVIR à sélectionner l'élément dans Storyblok
    // -> ne pas preventDefault / stopPropagation pour que l'événement remonte jusqu'au parent
    // Astuce: meta/ctrl/shift-click autorise quand même l'ouverture locale si besoin
    if (isEditor && !(e.metaKey || e.ctrlKey || e.shiftKey)) return;

    setPressed(true);
    setTimeout(() => {
      if (onOpen) {
        onOpen();
      }
      setPressed(false);
    }, 90);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      // Sans texte alternatif, le bouton n'aurait pas de nom pour un lecteur d'écran
      aria-label={alt ? undefined : 'Open image'}
      className={`group relative block w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 pressable ${
        pressed ? 'is-pressed' : ''
      } ${isEditor ? 'pointer-events-none' : 'cursor-pointer'}`}
      style={{ width: thumbWidth, height: thumbHeight, lineHeight: 0 }}
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover z-0"
          priority={priority}
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
  );
}

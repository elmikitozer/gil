'use client';

import Image from 'next/image';
import HoverCover from '@/app/components/ui/HoverCover';
import { extractVimeoId } from '@/app/utils/vimeo';
import useIsStoryblokEditor from './useIsStoryblokEditor';

type Props = {
  vimeoId: string;
  width: number | string;
  height: number | string;
  onOpen: () => void;
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
  const isStoryblokEditor = useIsStoryblokEditor();

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
          onOpen();
        }}
        className="group relative block w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 cursor-pointer overflow-hidden"
        style={{ width, height, lineHeight: 0 }}
      >
        {/* Thumbnail avec lazy loading */}
        {thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt={hoverTitle || 'Vidéo'}
            fill
            sizes="(min-width: 768px) 33vw, 50vw"
            className="object-cover"
            unoptimized
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
    </>
  );
}

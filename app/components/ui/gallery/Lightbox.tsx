'use client';

import React, { useMemo } from 'react';
import YARLightbox, { SlideImage } from 'yet-another-react-lightbox';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import './lightbox-custom.css';
import { useGallery } from './GalleryContext';
import { extractVimeoId } from '@/app/utils/vimeo';

export default function Lightbox() {
  const { isOpen, close, items, index, openAt } = useGallery();

  // Hide carousel controls when there's only one item
  const isSingleItem = items.length === 1;

  // Convert our Item types to yet-another-react-lightbox format
  const slides = useMemo((): SlideImage[] => {
    return items.map((item) => {
      if (item.kind === 'image') {
        return {
          src: item.src,
          alt: item.alt ?? '',
          title: item.title,
        };
      }

      // For videos and vimeo, use poster as thumbnail or transparent pixel
      const thumbnailSrc =
        (item.kind === 'video' || item.kind === 'hybrid' || item.kind === 'vimeo') && item.poster
          ? item.poster
          : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

      return {
        src: thumbnailSrc,
        alt: item.alt ?? '',
        title: item.title,
      };
    });
  }, [items]);

  return (
    <YARLightbox
      open={isOpen}
      close={close}
      slides={slides}
      index={index}
      plugins={isSingleItem ? [] : [Thumbnails]}
      on={{
        view: ({ index: newIndex }) => {
          if (newIndex !== index) {
            openAt(newIndex);
          }
        },
      }}
      carousel={{
        finite: isSingleItem ? true : false,
        preload: 2,
      }}
      animation={{
        fade: 250,
        swipe: 300,
      }}
      controller={{
        closeOnBackdropClick: true,
      }}
      thumbnails={
        isSingleItem
          ? undefined
          : {
              position: 'bottom',
              width: 64,
              height: 64,
              border: 2,
              borderRadius: 4,
              padding: 8,
              gap: 8,
            }
      }
      toolbar={{
        buttons: isSingleItem
          ? ['close']
          : ['close'],
      }}
      render={{
        slide: () => {
          const item = items[index];
          if (!item) return undefined;

          // Custom rendering for videos
          if (item.kind === 'video') {
            const maxHeight = isSingleItem ? '90vh' : '80vh';
            const maxWidth = isSingleItem ? '90vw' : '80vw';
            return (
              <div className="flex items-center justify-center w-full h-full">
                <div className="relative flex flex-col items-start">
                  <video
                    key={item.srcMp4}
                    className={`object-contain`}
                    style={{ maxHeight, maxWidth }}
                    controls
                    autoPlay
                    playsInline
                    muted={false}
                    loop
                    preload="auto"
                    poster={item.poster ?? undefined}
                  >
                    {item.srcWebm ? <source src={item.srcWebm} type="video/webm" /> : null}
                    <source src={item.srcMp4} type="video/mp4" />
                  </video>
                  {item.title && (
                    <div className="mt-2 text-sm text-black dark:text-white pointer-events-none">
                      {item.title}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Custom rendering for vimeo/hybrid
          if (item.kind === 'vimeo' || item.kind === 'hybrid') {
            const vimeoId = extractVimeoId(item.vimeoId);
            const maxVW = isSingleItem ? '90vw' : '90vw';
            const maxVH = isSingleItem ? '90vh' : '90vh';
            return (
              <div className="flex items-center justify-center w-full h-full">
                <div className="flex flex-col items-start">
                  <div className={`relative w-[min(${maxVW},160vh)] h-[min(${maxVH},50.625vw)]`}>
                    <iframe
                      key={vimeoId}
                      src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&title=0&byline=0&portrait=0`}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={item.title || 'Vidéo'}
                    />
                  </div>
                  {item.title && (
                    <div className="mt-2 text-sm text-black dark:text-white pointer-events-none">
                      {item.title}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // For images, add title below if present
          if (item.kind === 'image') {
            const maxHeight = isSingleItem ? '90vh' : '80vh';
            const maxWidth = isSingleItem ? '90vw' : '80vw';

            if (item.title) {
              return (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="flex flex-col items-start">
                    <img
                      src={item.src}
                      alt={item.alt ?? ''}
                      className="object-contain"
                      style={{ maxHeight, maxWidth }}
                    />
                    <div className="mt-2 text-sm text-black dark:text-white pointer-events-none">
                      {item.title}
                    </div>
                  </div>
                </div>
              );
            }

            // No title - use default rendering with adjusted size
            return (
              <div className="flex items-center justify-center w-full h-full">
                <img
                  src={item.src}
                  alt={item.alt ?? ''}
                  className="object-contain"
                  style={{ maxHeight, maxWidth }}
                />
              </div>
            );
          }

          return undefined;
        },
      }}
      styles={{
        container: {
          backgroundColor: 'var(--yarl__color_backdrop, rgb(255, 255, 255))',
        },
      }}
      className="dark:bg-black bg-white"
    />
  );
}

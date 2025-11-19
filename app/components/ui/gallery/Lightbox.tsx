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
      plugins={[Thumbnails]}
      on={{
        view: ({ index: newIndex }) => {
          if (newIndex !== index) {
            openAt(newIndex);
          }
        },
      }}
      carousel={{
        finite: false,
        preload: 2,
      }}
      animation={{
        fade: 250,
        swipe: 300,
      }}
      controller={{
        closeOnBackdropClick: true,
      }}
      thumbnails={{
        position: 'bottom',
        width: 64,
        height: 64,
        border: 2,
        borderRadius: 4,
        padding: 8,
        gap: 8,
      }}
      render={{
        slide: () => {
          const item = items[index];
          if (!item) return undefined;

          // Custom rendering for videos
          if (item.kind === 'video') {
            return (
              <div className="flex items-center justify-center w-full h-full">
                <video
                  key={item.srcMp4}
                  className="max-h-[80vh] max-w-[80vw] object-contain"
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
              </div>
            );
          }

          // Custom rendering for vimeo/hybrid
          if (item.kind === 'vimeo' || item.kind === 'hybrid') {
            const vimeoId = extractVimeoId(item.vimeoId);
            return (
              <div className="flex items-center justify-center w-full h-full">
                <div className="relative w-[min(90vw,160vh)] h-[min(90vh,50.625vw)]">
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
              </div>
            );
          }

          // For images, return undefined to use default rendering
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

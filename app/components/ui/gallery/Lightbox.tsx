'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import YARLightbox, { SlideImage } from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import './lightbox-custom.css';
import { useGallery } from './GalleryContext';
import LightboxCaption from './LightboxCaption';
import { extractVimeoId } from '@/app/utils/vimeo';
import { storyblokImageLoader, storyblokImageSize } from '@/lib/storyblok-image';

// Taille d'affichage de l'image (px CSS) en fonction de la fenêtre : la zone
// disponible est la fenêtre moins les marges de la lightbox (32 + 32 px), et sa
// hauteur 90 % (92 % sur mobile) de la hauteur moins les marges verticales.
// Le navigateur en déduit la largeur à télécharger, devicePixelRatio compris.
function lightboxSizes(ratio: number): string {
  const r = ratio.toFixed(3);
  return [
    `(min-width: 768px) min(calc(100vw - 64px), calc(${r} * 0.9 * (100vh - 112px)))`,
    `min(calc(100vw - 64px), calc(${r} * 0.92 * (100vh - 64px)))`,
  ].join(', ');
}

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
        alt: item.alt || item.title || '',
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
      plugins={[]}
      on={{
        view: ({ index: newIndex }) => {
          if (newIndex !== index) {
            openAt(newIndex);
          }
        },
      }}
      carousel={{
        finite: isSingleItem,
        // Une image voisine de chaque côté : 3 images chargées à l'ouverture d'un album.
        preload: 1,
      }}
      animation={{
        fade: 250,
        swipe: 300,
      }}
      controller={{
        closeOnBackdropClick: true,
      }}
      toolbar={{
        buttons: ['close'],
      }}
      render={{
        slide: ({ slide }) => {
          const itemIndex = slides.findIndex((s) => s === slide);
          const item = items[itemIndex];
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
                    aria-label={item.alt || item.title || undefined}
                    poster={item.poster ?? undefined}
                  >
                    {item.srcWebm ? <source src={item.srcWebm} type="video/webm" /> : null}
                    <source src={item.srcMp4} type="video/mp4" />
                  </video>
                  {item.title && (
                    <div className="mt-2 text-lg text-black pointer-events-none">
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
            return (
              <div className="flex items-center justify-center w-full h-full">
                <div className="flex flex-col items-start">
                  <div className="relative w-[min(90vw,160vh)] h-[min(90vh,50.625vw)]">
                    <iframe
                      key={vimeoId}
                      src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&title=0&byline=0&portrait=0`}
                      className="w-full h-full"
                      style={{ border: 'none' }}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={item.alt || item.title || 'Video'}
                    />
                  </div>
                  {item.title && (
                    <div className="mt-2 text-lg text-black pointer-events-none">
                      {item.title}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // For images - uniform height, symmetric padding top/bottom
          if (item.kind === 'image') {
            const total = items.length;
            const current = itemIndex + 1;
            // Dimensions d'origine (lues dans l'URL) ; valeur par défaut pour un asset hors Storyblok
            const size = storyblokImageSize(item.src) ?? { width: 1600, height: 1067 };

            return (
              <LightboxCaption
                title={item.title}
                current={current}
                total={total}
                showCounter={!isSingleItem}
              >
                <Image
                  loader={storyblokImageLoader}
                  src={item.src}
                  alt={item.alt ?? ''}
                  width={size.width}
                  height={size.height}
                  sizes={lightboxSizes(size.width / size.height)}
                  loading="eager"
                  className="object-contain w-full h-full"
                  style={{ maxWidth: size.width, maxHeight: size.height }}
                />
              </LightboxCaption>
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
      className="bg-white"
    />
  );
}

/**
 * VideoItemHybrid - Composant Storyblok pour vidéos
 *
 * Supporte :
 * - Vimeo (via ID)
 * - MP4 direct (via URL Storyblok Assets ou autre)
 * - WebM en complément
 *
 * Usage dans Storyblok :
 * - Créer un bloc "video_item_hybrid"
 * - Choisir la source (vimeo ou mp4)
 * - Remplir les champs appropriés
 */

'use client';

import { storyblokEditable } from '@storyblok/react/rsc';
import type { SbBlokData } from '@storyblok/react/rsc';

type VideoItemHybridBlok = SbBlokData & {
  video_source?: 'vimeo' | 'mp4';
  vimeoId?: string;
  srcMp4?: string;
  srcWebm?: string;
  poster?: { filename?: string };
  ratio?: string;
  title?: string;
  caption?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
};

export default function VideoItemHybrid({ blok }: { blok: VideoItemHybridBlok }) {
  const source = blok.video_source || 'mp4';
  const ratio = blok.ratio || '16:9';

  // Calculate padding-bottom for aspect ratio
  const getPaddingBottom = (r: string) => {
    if (r === '16:9') return '56.25%';
    if (r === '9:16') return '177.78%';
    if (r === '1:1') return '100%';
    if (r === '4:3') return '75%';
    // Parse custom ratio like "16:9" or "16/9"
    const parts = r.includes(':') ? r.split(':') : r.split('/');
    if (parts.length === 2) {
      const w = parseFloat(parts[0]);
      const h = parseFloat(parts[1]);
      if (w > 0 && h > 0) return `${(h / w) * 100}%`;
    }
    return '56.25%'; // default 16:9
  };

  const paddingBottom = getPaddingBottom(ratio);

  if (source === 'vimeo' && blok.vimeoId) {
    return (
      <div {...storyblokEditable(blok)} className="w-full">
        <div className="relative w-full" style={{ paddingBottom }}>
          <iframe
            src={`https://player.vimeo.com/video/${blok.vimeoId}?autoplay=${
              blok.autoplay ? 1 : 0
            }&loop=${blok.loop ? 1 : 0}&muted=${blok.muted ? 1 : 0}&title=0&byline=0&portrait=0`}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={blok.title || 'Vidéo'}
          />
        </div>
        {blok.caption && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{blok.caption}</p>
        )}
      </div>
    );
  }

  if (source === 'mp4' && blok.srcMp4) {
    return (
      <div {...storyblokEditable(blok)} className="w-full">
        <video
          className="w-full h-auto"
          poster={blok.poster?.filename}
          autoPlay={blok.autoplay}
          loop={blok.loop}
          muted={blok.muted}
          controls
          playsInline
          preload="metadata"
          onError={(e) => {
            console.error('Erreur de chargement vidéo:', e);
            console.error('URL:', blok.srcMp4);
          }}
        >
          {blok.srcWebm && <source src={blok.srcWebm} type="video/webm" />}
          <source src={blok.srcMp4} type="video/mp4" />
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
        {blok.caption && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{blok.caption}</p>
        )}
      </div>
    );
  }

  // Fallback si aucune source n'est définie
  return (
    <div
      {...storyblokEditable(blok)}
      className="w-full p-4 bg-yellow-100 border border-yellow-400 rounded"
    >
      <p className="text-yellow-800">
        ⚠️ Vidéo non configurée. Veuillez choisir une source (Vimeo ou MP4) et remplir les champs
        appropriés.
      </p>
    </div>
  );
}

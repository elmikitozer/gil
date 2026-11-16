// Types partagés par la grille (MasonryColumns), le contexte de la galerie
// (GalleryContext), la lightbox et la conversion des blocs Storyblok
// (lib/gallery-items.ts). Module sans code : importable partout.
import type { SbBlokData } from '@storyblok/react/rsc';

export type ImageItem = {
  kind: 'image';
  src: string;
  alt?: string;
  title?: string;
  caption?: string;
  blok?: SbBlokData;
  // Props pour l'album (peut contenir images + vidéos)
  albumPhotos?: Item[];
  isCoverPhoto?: boolean;
  /** Proportion connue d'avance (lue dans l'URL de l'asset Storyblok). */
  ratio?: number;
};

export type VideoItem = {
  kind: 'video';
  srcMp4: string;
  srcWebm?: string;
  poster?: string;
  alt?: string;
  ratio?: string;
  title?: string;
  caption?: string;
  blok?: SbBlokData;
};

export type VimeoVideoItem = {
  kind: 'vimeo';
  vimeoId: string;
  poster?: string;
  alt?: string;
  ratio?: string;
  title?: string;
  caption?: string;
  blok?: SbBlokData;
};

export type HybridVideoItem = {
  kind: 'hybrid';
  srcMp4: string; // Preview Cloudinary pour la grille
  vimeoId: string; // Vidéo complète Vimeo pour la lightbox
  srcWebm?: string;
  poster?: string;
  alt?: string;
  ratio?: string;
  title?: string;
  caption?: string;
  blok?: SbBlokData;
};

export type Item = ImageItem | VideoItem | VimeoVideoItem | HybridVideoItem;

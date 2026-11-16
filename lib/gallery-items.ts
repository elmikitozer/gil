// Conversion des blocs Storyblok de la grille (`media_item`, `video_item`) en
// éléments de galerie (`Item`). Fonctions pures, sans « server-only » : elles
// servent au rendu public (serveur) comme à l'aperçu de l'éditeur (navigateur).
import type { SbBlokData } from '@storyblok/react/rsc';
import type { ImageItem, Item } from '@/app/components/ui/gallery/types';
import { storyblokImageRatio } from '@/lib/storyblok-image';

export type StoryblokAsset = {
  filename?: string;
  alt?: string;
  title?: string;
  caption?: string;
};

export type VideoItemBlok = SbBlokData & {
  component: 'video_item';
  vimeoId?: string;
  srcMp4?: string;
  srcWebm?: string;
  poster?: { filename?: string };
  alt?: string;
  ratio?: string;
  title?: string;
  caption?: string;
};

export type MediaItemBlok = SbBlokData & {
  component: 'media_item';
  media?: { filename?: string; alt?: string };
  alt?: string;
  title?: string;
  caption?: string;
  // Champs pour l'album
  album_photos?: StoryblokAsset[];
  album_videos?: VideoItemBlok[];
  is_cover_photo?: boolean;
};

export type GridEntryBlok = MediaItemBlok | VideoItemBlok;

type AlbumEntry = StoryblokAsset | VideoItemBlok;

function isVideoItemBlok(entry: AlbumEntry): entry is VideoItemBlok {
  return 'component' in entry && entry.component === 'video_item';
}

/**
 * Bloc `video_item` → élément de galerie :
 * - `srcMp4` + `vimeoId` : hybride (aperçu MP4 dans la grille, Vimeo dans la lightbox) ;
 * - `vimeoId` seul : Vimeo ; `srcMp4` seul : vidéo MP4 ; sinon `null`.
 *
 * `albumTitle` n'est fourni que pour une vidéo d'album : à défaut de titre
 * propre, elle reprend celui du `media_item` qui la contient. Sans lui, c'est
 * une vignette de la grille, qui garde son bloc (pour l'édition dans Storyblok).
 */
export function videoItemToItem(blok: VideoItemBlok, albumTitle?: string): Item | null {
  const isAlbumEntry = albumTitle !== undefined;
  const title = isAlbumEntry ? blok.title || albumTitle : blok.title;
  const common = {
    poster: blok.poster?.filename,
    // Texte alternatif : celui du bloc, à défaut le titre (sans les deux, le composant met un libellé)
    alt: blok.alt || title || undefined,
    ratio: blok.ratio,
    title,
    caption: blok.caption,
    ...(isAlbumEntry ? {} : { blok }),
  };
  if (blok.srcMp4 && blok.vimeoId) {
    return {
      kind: 'hybrid',
      srcMp4: blok.srcMp4, // aperçu pour la grille
      vimeoId: blok.vimeoId, // vidéo complète pour la lightbox
      srcWebm: blok.srcWebm,
      ...common,
    };
  }
  if (blok.vimeoId) return { kind: 'vimeo', vimeoId: blok.vimeoId, ...common };
  if (blok.srcMp4) return { kind: 'video', srcMp4: blok.srcMp4, srcWebm: blok.srcWebm, ...common };
  console.warn('video_item sans vimeoId ni srcMp4:', blok);
  return null;
}

/** Élément d'un album (`album_photos` : asset image ; `album_videos` : bloc `video_item`). */
function albumEntryToItem(entry: AlbumEntry, albumTitle: string): Item | null {
  if (isVideoItemBlok(entry)) return videoItemToItem(entry, albumTitle);
  if (!entry.filename) return null;
  const title = entry.title || albumTitle;
  return {
    kind: 'image',
    src: entry.filename,
    title,
    alt: entry.alt || title,
    caption: entry.caption || '',
  };
}

/** Bloc `media_item` → vignette image, avec son album éventuel ; `null` sans image. */
export function mediaItemToItem(blok: MediaItemBlok): ImageItem | null {
  const src = blok.media?.filename;
  if (!src) return null;

  // Photos (multi-assets) puis vidéos (blocs video_item) de l'album
  const entries: AlbumEntry[] = [
    ...(Array.isArray(blok.album_photos) ? blok.album_photos : []),
    ...(Array.isArray(blok.album_videos) ? blok.album_videos : []),
  ];
  const albumTitle = blok.title || '';
  const albumPhotos =
    entries.length > 0
      ? entries
          .map((entry) => albumEntryToItem(entry, albumTitle))
          .filter((item): item is Item => item !== null)
      : undefined;

  return {
    kind: 'image',
    src,
    // Texte alternatif : celui du bloc, puis celui de l'asset, puis le titre
    alt: blok.alt || blok.media?.alt || blok.title || undefined,
    title: blok.title,
    caption: blok.caption,
    blok,
    albumPhotos,
    isCoverPhoto: blok.is_cover_photo === true,
    ratio: storyblokImageRatio(src),
  };
}

/** Éléments de la grille (`grid_masonry.items`), dans l'ordre du contenu. */
export function gridItems(entries: GridEntryBlok[] | undefined): Item[] {
  const items: Item[] = [];
  for (const entry of entries ?? []) {
    const item =
      entry?.component === 'media_item'
        ? mediaItemToItem(entry)
        : entry?.component === 'video_item'
        ? videoItemToItem(entry)
        : null;
    if (item) items.push(item);
  }
  return items;
}

'use client';

import { storyblokEditable } from '@storyblok/react/rsc';
import type { SbBlokData } from '@storyblok/react/rsc';
import MasonryColumns, {
  type Item,
  type ImageItem,
  type VideoItem,
  type VimeoVideoItem,
  type HybridVideoItem,
} from '@/app/components/MasonryColumns';
import { storyblokImageRatio } from '@/lib/storyblok-image';

type StoryblokAsset = {
  filename?: string;
  alt?: string;
  title?: string;
  caption?: string;
};

type VideoItemBlok = SbBlokData & {
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

type MediaItemBlok = SbBlokData & {
  component: 'media_item';
  media?: { filename?: string };
  alt?: string;
  title?: string;
  caption?: string;
  // Champs pour l'album
  album_photos?: StoryblokAsset[];
  album_videos?: VideoItemBlok[];
  is_cover_photo?: boolean;
};

type AlbumEntry = StoryblokAsset | VideoItemBlok;

type GridMasonryBlok = SbBlokData & {
  items?: Array<MediaItemBlok | VideoItemBlok>;
};

function isVideoItemBlok(entry: AlbumEntry): entry is VideoItemBlok {
  return 'component' in entry && entry.component === 'video_item';
}

export default function GridMasonry({ blok }: { blok: GridMasonryBlok }) {
  const items: Item[] = (blok.items ?? []).reduce<Item[]>((acc, c) => {
    if (c?.component === 'media_item' && c?.media?.filename) {
      // Traitement des photos d'album et vidéos
      let albumPhotos: Item[] | undefined;

      // Fusionner album_photos (Multi-Assets) et album_videos (Blocks video_item)
      const allMedia: AlbumEntry[] = [];

      // Ajouter les photos du Multi-Assets
      if (Array.isArray(c.album_photos)) {
        allMedia.push(...c.album_photos);
      }

      // Ajouter les vidéos du champ album_videos (blocs video_item)
      if (Array.isArray(c.album_videos)) {
        allMedia.push(...c.album_videos);
      }

      if (allMedia.length > 0) {
        const mediaItemTitle = c.title || ''; // Titre du media_item
        const mapped = allMedia.map((entry): Item | null => {
          if (isVideoItemBlok(entry)) {
            const poster = entry.poster?.filename;
            const title = entry.title || mediaItemTitle;
            // Bloc video_item (HYBRID)
            if (entry.srcMp4 && entry.vimeoId) {
              return {
                kind: 'hybrid' as const,
                srcMp4: entry.srcMp4,
                vimeoId: entry.vimeoId,
                poster,
                alt: entry.alt,
                title,
              };
            }
            // Bloc video_item (Vimeo seul)
            if (entry.vimeoId) {
              return { kind: 'vimeo' as const, vimeoId: entry.vimeoId, poster, alt: entry.alt, title };
            }
            // Bloc video_item (Cloudinary/MP4 seul)
            if (entry.srcMp4) {
              return { kind: 'video' as const, srcMp4: entry.srcMp4, poster, alt: entry.alt, title };
            }
            return null;
          }
          // Image normale
          if (entry.filename) {
            return {
              kind: 'image' as const,
              src: entry.filename,
              alt: entry.alt || '',
              title: entry.title || mediaItemTitle,
              caption: entry.caption || '',
            };
          }
          return null;
        });

        albumPhotos = mapped.filter((item): item is Item => item !== null);
      }

      const item: ImageItem = {
        kind: 'image',
        src: c.media.filename as string,
        alt: c.alt as string | undefined,
        title: c.title as string | undefined,
        caption: c.caption as string | undefined,
        blok: c,
        albumPhotos,
        isCoverPhoto: c.is_cover_photo === true,
        ratio: storyblokImageRatio(c.media.filename),
      };
      acc.push(item);
    } else if (c?.component === 'video_item') {
      // HYBRIDE : Si les deux sont présents (preview Cloudinary + vidéo complète Vimeo)
      if (c.srcMp4 && c.vimeoId) {
        const item: HybridVideoItem = {
          kind: 'hybrid',
          srcMp4: c.srcMp4 as string, // Preview pour grille
          vimeoId: c.vimeoId as string, // Vidéo complète pour lightbox
          srcWebm: c.srcWebm as string | undefined,
          poster: c.poster?.filename as string | undefined,
          alt: c.alt as string | undefined,
          ratio: c.ratio as string | undefined,
          title: c.title as string | undefined,
          caption: c.caption as string | undefined,
          blok: c,
        };
        acc.push(item);
      }
      // Vidéo Vimeo uniquement
      else if (c.vimeoId) {
        const item: VimeoVideoItem = {
          kind: 'vimeo',
          vimeoId: c.vimeoId as string,
          poster: c.poster?.filename as string | undefined,
          alt: c.alt as string | undefined,
          ratio: c.ratio as string | undefined,
          title: c.title as string | undefined,
          caption: c.caption as string | undefined,
          blok: c,
        };
        acc.push(item);
      }
      // Vidéo MP4 uniquement
      else if (c.srcMp4) {
        const item: VideoItem = {
          kind: 'video',
          srcMp4: c.srcMp4 as string,
          srcWebm: c.srcWebm as string | undefined,
          poster: c.poster?.filename as string | undefined,
          alt: c.alt as string | undefined,
          ratio: c.ratio as string | undefined,
          title: c.title as string | undefined,
          caption: c.caption as string | undefined,
          blok: c,
        };
        acc.push(item);
      }
      // Debug
      else {
        console.warn('video_item sans vimeoId ni srcMp4:', c);
      }
    }
    return acc;
  }, []);

  return (
    <section
      {...storyblokEditable(blok)}
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen px-[8px] md:px-[12px]"
    >
      <MasonryColumns items={items} gap={10} />
    </section>
  );
}

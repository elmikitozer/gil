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

type MediaItemBlok = SbBlokData & {
  component: 'media_item';
  media?: { filename?: string };
  alt?: string;
  title?: string;
  caption?: string;
};

type VideoItemBlok = SbBlokData & {
  component: 'video_item';
  video_source?: 'mp4' | 'vimeo';
  vimeoId?: string;
  srcMp4?: string;
  srcWebm?: string;
  poster?: { filename?: string };
  alt?: string;
  ratio?: string;
  title?: string;
  caption?: string;
};

type GridMasonryBlok = SbBlokData & {
  items?: Array<MediaItemBlok | VideoItemBlok>;
};

export default function GridMasonry({ blok }: { blok: GridMasonryBlok }) {
  const items: Item[] = (blok.items ?? []).reduce<Item[]>((acc, c) => {
    if (c?.component === 'media_item' && c?.media?.filename) {
      const item: ImageItem = {
        kind: 'image',
        src: c.media.filename as string,
        alt: c.alt as string | undefined,
        title: c.title as string | undefined,
        caption: c.caption as string | undefined,
        blok: c,
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

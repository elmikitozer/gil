'use client';

import { storyblokEditable } from '@storyblok/react/rsc';
import type { SbBlokData } from '@storyblok/react/rsc';
import MasonryColumns, {
  type Item,
  type ImageItem,
  type VideoItem,
  type VimeoVideoItem,
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
      // Support Vimeo ET MP4
      const source = c.video_source || (c.vimeoId ? 'vimeo' : 'mp4');

      // Vidéo Vimeo
      if ((source === 'vimeo' || c.vimeoId) && c.vimeoId) {
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
      // Vidéo MP4 (condition moins stricte pour compatibilité)
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
      // Si ni vimeoId ni srcMp4, on affiche quand même (pour debug)
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

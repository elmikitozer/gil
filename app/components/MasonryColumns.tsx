'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ZoomableImage from './ZoomableImage';
import ZoomableVideo from './ZoomableVideo';
import ZoomableVimeo from './ZoomableVimeo';
import { storyblokEditable } from '@storyblok/react/rsc';
import type { SbBlokData } from '@storyblok/react/rsc';

import { GalleryProvider, useGallery } from './ui/gallery/GalleryContext';
import Lightbox from './ui/gallery/Lightbox';

export type ImageItem = {
  kind: 'image';
  src: string;
  alt?: string;
  title?: string;
  caption?: string;
  blok?: SbBlokData;
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
export type Item = ImageItem | VideoItem | VimeoVideoItem;

function parseRatio(r?: string): number | undefined {
  if (!r || r === 'auto') return;
  const byColon = r.split(':');
  const bySlash = r.split('/');
  const parts = byColon.length === 2 ? byColon : bySlash.length === 2 ? bySlash : [];
  if (parts.length === 2) {
    const w = parseFloat(parts[0]);
    const h = parseFloat(parts[1]);
    if (w > 0 && h > 0) return w / h;
  }
  return;
}

function useContainerWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr?.width) setW(Math.round(cr.width));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

export default function MasonryColumns({ items, gap = 0 }: { items: Item[]; gap?: number }) {
  const [ref, cw] = useContainerWidth<HTMLDivElement>();
  const [ratios, setRatios] = useState<Record<string, number>>({});

  const cols = useMemo(() => (cw >= 1280 ? 4 : cw >= 768 ? 3 : 2), [cw]);
  const colW = useMemo(
    () => (cw && cols ? Math.max(1, Math.floor((cw - gap * (cols - 1)) / cols)) : 0),
    [cw, cols, gap]
  );

  const columns = useMemo(() => {
    const arr: { item: Item; w: number; h: number; key: string; gi: number }[][] = Array.from(
      { length: cols },
      () => []
    );
    const heights = Array.from({ length: cols }, () => 0);
    if (!colW) return arr;

    let gi = 0; // index global dans la liste
    for (const item of items) {
      const key =
        item.kind === 'image'
          ? `img:${item.src}`
          : item.kind === 'video'
          ? `vid:${item.srcWebm || item.srcMp4}`
          : `vimeo:${item.vimeoId}`;
      const override =
        item.kind === 'video' || item.kind === 'vimeo' ? parseRatio(item.ratio) : undefined;
      const r = override ?? ratios[key] ?? 16 / 9;
      const w = colW;
      const h = Math.max(1, Math.round(w / r));

      let minIdx = 0;
      for (let i = 1; i < cols; i++) {
        if (heights[i] < heights[minIdx]) minIdx = i;
      }
      arr[minIdx].push({ item, w, h, key, gi });
      heights[minIdx] += h + gap;
      gi++;
    }
    return arr;
  }, [items, cols, colW, ratios, gap]);

  return (
    <GalleryProvider items={items}>
      <div ref={ref} className="flex" style={{ gap }}>
        {columns.map((col, i) => (
          <MasonryColumn key={i} col={col} colW={colW} gap={gap} setRatios={setRatios} />
        ))}
      </div>
      <Lightbox />
    </GalleryProvider>
  );
}

function MasonryColumn({
  col,
  colW,
  gap,
  setRatios,
}: {
  col: { item: Item; w: number; h: number; key: string; gi: number }[];
  colW: number;
  gap: number;
  setRatios: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}) {
  const { openAt } = useGallery();

  return (
    <div className="flex flex-col" style={{ rowGap: gap, width: colW }}>
      {col.map(({ item, w, h, key, gi }) => {
        if (item.kind === 'image') {
          return (
            <div key={key} {...(item.blok ? storyblokEditable(item.blok) : {})}>
              <ZoomableImage
                src={item.src}
                alt={item.alt}
                thumbWidth={w}
                thumbHeight={h}
                sizes={`${colW}px`}
                hoverTitle={item.title}
                hoverCaption={item.caption}
                onLoaded={(nw, nh) => setRatios((p) => (p[key] ? p : { ...p, [key]: nw / nh }))}
                onOpen={() => openAt(gi)}
              />
            </div>
          );
        } else if (item.kind === 'video') {
          return (
            <div key={key} {...(item.blok ? storyblokEditable(item.blok) : {})}>
              <ZoomableVideo
                srcMp4={item.srcMp4}
                srcWebm={item.srcWebm}
                poster={item.poster}
                width={w}
                height={h}
                hoverTitle={item.title}
                hoverCaption={item.caption}
                onLoaded={(vw, vh) => setRatios((p) => (p[key] ? p : { ...p, [key]: vw / vh }))}
                onOpen={() => openAt(gi)}
              />
            </div>
          );
        } else if (item.kind === 'vimeo') {
          return (
            <div key={key} {...(item.blok ? storyblokEditable(item.blok) : {})}>
              <ZoomableVimeo
                vimeoId={item.vimeoId}
                poster={item.poster}
                width={w}
                height={h}
                hoverTitle={item.title}
                hoverCaption={item.caption}
                onOpen={() => openAt(gi)}
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type JGImage = { src: string; alt?: string };
type RowItem = JGImage & { w: number; h: number }; // dimensions calculées

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

export default function JustifiedGallery({
  images,
  gap = 0, // écart très léger entre images
  rowHeights = { base: 220, md: 280, xl: 340 }, // cible: mobile / tablet / desktop
}: {
  images: JGImage[];
  gap?: number;
  rowHeights?: { base: number; md: number; xl: number };
}) {
  const [ref, cw] = useContainerWidth<HTMLDivElement>();
  const [ratios, setRatios] = useState<Record<string, number>>({}); // src -> ratio w/h

  // hauteur de ligne cible responsive
  const targetH = useMemo(() => {
    if (cw >= 1280) return rowHeights.xl;
    if (cw >= 768) return rowHeights.md;
    return rowHeights.base;
  }, [cw, rowHeights]);

  const onLoaded = useCallback((src: string, natW: number, natH: number) => {
    if (natW && natH) {
      setRatios((prev) => (prev[src] ? prev : { ...prev, [src]: natW / natH }));
    }
  }, []);

  // Algorithme "justified rows" simple (préserve l'ordre)
  const rows: RowItem[][] = useMemo(() => {
    if (!cw || images.length === 0) return [];
    const maxWidth = cw; // on laisse le padding au parent
    const fallbackRatio = 1.5;

    const out: RowItem[][] = [];
    let cur: RowItem[] = [];
    let rowW = 0;

    const pushRow = () => {
      if (cur.length === 0) return;
      const gapsTotal = gap * (cur.length - 1);
      const scale = (maxWidth - gapsTotal) / rowW;
      for (const it of cur) {
        it.w = Math.max(1, Math.round(it.w * scale));
        it.h = Math.max(1, Math.round(it.h * scale));
      }
      out.push(cur);
      cur = [];
      rowW = 0;
    };

    for (const img of images) {
      const r = ratios[img.src] || fallbackRatio;
      const w = Math.round(r * targetH);
      const h = targetH;
      const nextRowW = (cur.length ? rowW + gap : rowW) + w;

      if (nextRowW > maxWidth && cur.length > 0) {
        // on ferme la ligne courante, puis on démarre avec l'image en attente
        pushRow();
      }
      cur.push({ ...img, w, h });
      rowW = (cur.length === 1 ? 0 : gap * (cur.length - 1)) + cur.reduce((s, x) => s + x.w, 0);
    }
    // dernière ligne: on la laisse "ragged right" (pas étirée)
    if (cur.length) out.push(cur);
    return out;
  }, [cw, images, ratios, targetH, gap]);

  // Lightbox minimaliste (zoom)
  const [zoom, setZoom] = useState<string | null>(null);
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setZoom(null);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [zoom]);

  return (
    <>
      <div ref={ref} className="w-full">
        {rows.map((row, i) => (
          <div key={i} className="flex" style={{ gap: `${gap}px`, marginBottom: `${gap}px` }}>
            {row.map((it, j) => (
              <button
                key={it.src + j}
                type="button"
                onClick={() => setZoom(it.src)}
                className="relative block focus:outline-none cursor-zoom-in" // ← ICI: 'relative'
                style={{ width: it.w, height: it.h, lineHeight: 0 }}
              >
                <Image
                  src={it.src}
                  alt={it.alt || ''}
                  fill
                  sizes={`${it.w}px`}
                  className="object-cover"
                  onLoad={(event) => {
                    const img = event.currentTarget;
                    onLoaded(it.src, img.naturalWidth, img.naturalHeight);
                  }}
                />
              </button>
            ))}
          </div>
        ))}
      </div>

      {zoom && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 cursor-zoom-out flex items-center justify-center p-0"
          onClick={() => setZoom(null)}
          aria-modal="true"
          role="dialog"
        >
          <Image src={zoom} alt="" fill className="object-contain" sizes="100vw" priority />
        </div>
      )}
    </>
  );
}

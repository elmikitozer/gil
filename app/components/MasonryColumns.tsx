"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ZoomableImage from "./ZoomableImage";
import ZoomableVideo from "./ZoomableVideo";

type ImageItem = { kind: "image"; src: string; alt?: string; title?: string };
type VideoItem = {
  kind: "video";
  srcMp4: string;
  srcWebm?: string;
  poster?: string;
  alt?: string;
  ratio?: string;
  title?: string;
};
type Item = ImageItem | VideoItem;

// helper: "16:9", "9:16", "3/2" → number

function parseRatio(r?: string): number | undefined {
  if (!r || r === "auto") return;
  const byColon = r.split(":");
  const bySlash = r.split("/");
  const parts =
    byColon.length === 2 ? byColon : bySlash.length === 2 ? bySlash : [];
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

export default function MasonryColumns({
  items,
  gap = 6,
}: {
  items: Item[];
  gap?: number;
}) {
  const [ref, cw] = useContainerWidth<HTMLDivElement>();
  const [ratios, setRatios] = useState<Record<string, number>>({}); // key -> w/h

  const cols = useMemo(() => (cw >= 1280 ? 4 : cw >= 768 ? 3 : 2), [cw]);
  const colW = useMemo(
    () =>
      cw && cols ? Math.max(1, Math.floor((cw - gap * (cols - 1)) / cols)) : 0,
    [cw, cols, gap]
  );

  const columns = useMemo(() => {
    // const fallback = 16 / 9;
    const arr: { item: Item; w: number; h: number; key: string }[][] =
      Array.from({ length: cols }, () => []);
    const heights = Array.from({ length: cols }, () => 0);
    if (!colW) return arr;

    for (const item of items) {
      const key =
        item.kind === "image"
          ? `img:${item.src}`
          : `vid:${item.srcWebm || item.srcMp4}`;
      const override =
        item.kind === "video" ? parseRatio(item.ratio) : undefined;
      const r = override ?? ratios[key] ?? 16 / 9; // fallback si rien de connu
      const w = colW;
      const h = Math.max(1, Math.round(w / r));

      let minIdx = 0;
      for (let i = 1; i < cols; i++)
        if (heights[i] < heights[minIdx]) minIdx = i;
      arr[minIdx].push({ item, w, h, key });
      heights[minIdx] += h + gap;
    }
    return arr;
  }, [items, cols, colW, ratios, gap]);

  return (
    <div ref={ref} className="flex" style={{ gap }}>
      {columns.map((col, i) => (
        <div
          key={i}
          className="flex flex-col"
          style={{ rowGap: gap, width: colW }}
        >
          {col.map(({ item, w, h, key }) =>
            item.kind === "image" ? (
              <ZoomableImage 
                key={key}
                src={item.src}
                alt={item.alt}
                thumbWidth={w}
                thumbHeight={h}
                sizes={`${colW}px`}
                hoverTitle={item.title}
                onLoaded={(nw, nh) =>
                  setRatios((p) => (p[key] ? p : { ...p, [key]: nw / nh }))
                }
              />
            ) : (
              <ZoomableVideo
                key={key}
                srcMp4={item.srcMp4}
                srcWebm={item.srcWebm}
                poster={item.poster}
                width={w}
                height={h}
                hoverTitle={item.title}
                onLoaded={(vw, vh) =>
                  setRatios((p) => (p[key] ? p : { ...p, [key]: vw / vh }))
                }
              />
            )
          )}
        </div>
      ))}
    </div>
  );
}

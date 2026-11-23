'use client';

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import ZoomableImage from './ZoomableImage';
import ZoomableVideo from './ZoomableVideo';
import ZoomableVimeo from './ZoomableVimeo';
import EditorVideoWarning from './EditorVideoWarning';
import { storyblokEditable } from '@storyblok/react/rsc';

import { GalleryProvider, useGallery } from './ui/gallery/GalleryContext';
import type { Item } from './ui/gallery/types';
import Lightbox from './ui/gallery/Lightbox';
import {
  DEFAULT_RATIO,
  computeVariants,
  layoutPx,
  tileVars,
  variantsCss,
} from '@/lib/masonry';

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

const subscribeNever = () => () => {};

function itemKey(item: Item, gi: number): string {
  const baseKey =
    item.kind === 'image'
      ? `img:${item.src}`
      : item.kind === 'video'
      ? `vid:${item.srcWebm || item.srcMp4}`
      : item.kind === 'hybrid'
      ? `hybrid:${item.srcMp4}:${item.vimeoId}`
      : `vimeo:${item.vimeoId}`;
  return `${gi}:${baseKey}`;
}

// Proportion « de départ » d'un élément : imposée (vidéos), lue dans l'URL
// (images Storyblok), sinon proportion par défaut en attendant la mesure.
function knownRatio(item: Item): number | undefined {
  if (item.kind === 'image') return item.ratio;
  return parseRatio(item.ratio);
}

// Attribut `sizes` des vignettes, valable avant toute mesure : largeur d'une
// colonne en fonction de la largeur de la fenêtre (mêmes seuils que la grille).
function thumbSizes(gap: number): string {
  const col = (pad: number, cols: number) => `calc((100vw - ${pad}px - ${gap * (cols - 1)}px) / ${cols})`;
  return [
    `(min-width: 1304px) ${col(24, 4)}`,
    `(min-width: 792px) ${col(24, 3)}`,
    `(min-width: 768px) ${col(24, 2)}`,
    col(16, 2),
  ].join(', ');
}

// Écart relatif toléré entre la proportion de l'URL et celle de l'image chargée
// (l'image redimensionnée est arrondie au pixel).
const RATIO_TOLERANCE = 0.03;

// Nombre de premières vignettes chargées sans attendre (toujours visibles en haut de page).
const EAGER_TILES = 4;

export default function MasonryColumns({ items, gap = 0 }: { items: Item[]; gap?: number }) {
  const scope = `mg${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [ref, cw] = useContainerWidth<HTMLDivElement>();
  // Proportions mesurées dans le navigateur, pour les éléments dont la
  // proportion n'est pas connue d'avance (vidéos, images hors Storyblok).
  const [measured, setMeasured] = useState<Record<string, number>>({});
  // « false » au rendu serveur et à l'hydratation, puis la vraie valeur.
  const noContainerQueries = useSyncExternalStore(
    subscribeNever,
    () => !CSS.supports('container-type', 'inline-size'),
    () => false
  );

  const keys = useMemo(() => items.map((item, gi) => itemKey(item, gi)), [items]);

  // Proportions connues avant toute mesure : identiques au rendu serveur.
  const baseRatios = useMemo(
    () => items.map((item) => knownRatio(item) ?? DEFAULT_RATIO),
    [items]
  );
  const variants = useMemo(() => computeVariants(baseRatios, gap), [baseRatios, gap]);
  const css = useMemo(() => variantsCss(scope, variants, gap), [scope, variants, gap]);

  // Tant qu'aucune mesure ne change une proportion, la mise en page vient du CSS
  // (identique au rendu serveur : rien ne bouge à l'hydratation). Dès qu'une
  // proportion mesurée diffère, le calcul exact en pixels prend le relais.
  const ratios = useMemo(
    () =>
      items.map((item, i) =>
        item.kind === 'image'
          ? measured[keys[i]] ?? knownRatio(item) ?? DEFAULT_RATIO
          : knownRatio(item) ?? measured[keys[i]] ?? DEFAULT_RATIO
      ),
    [items, keys, measured]
  );
  const changed = ratios.some((r, i) => r !== baseRatios[i]);
  const px = useMemo(
    () => (cw > 0 && (changed || noContainerQueries) ? layoutPx(ratios, cw, gap) : null),
    [cw, changed, noContainerQueries, ratios, gap]
  );
  const sizes = useMemo(() => thumbSizes(gap), [gap]);
  // Première tuile image de la grille (candidate au LCP) : seule à passer en haute priorité.
  const firstImageIndex = useMemo(() => items.findIndex((item) => item.kind === 'image'), [items]);

  return (
    <GalleryProvider items={items}>
      <div className={scope} style={{ containerType: 'inline-size' }}>
        <style>{css}</style>
        <div
          ref={ref}
          data-masonry=""
          className="mg-box relative"
          style={px ? { height: px.height } : undefined}
        >
          {items.map((item, gi) => (
            <MasonryTile
              key={keys[gi]}
              item={item}
              gi={gi}
              ratio={ratios[gi]}
              tileKey={keys[gi]}
              eager={gi < EAGER_TILES}
              highPriority={gi === firstImageIndex && gi < EAGER_TILES}
              sizes={sizes}
              pxTile={px ? { w: px.colW, ...px.tiles[gi] } : null}
              vars={px ? undefined : tileVars(variants, gi)}
              setMeasured={setMeasured}
            />
          ))}
        </div>
      </div>
      <Lightbox />
    </GalleryProvider>
  );
}

type TileProps = {
  item: Item;
  gi: number;
  ratio: number;
  tileKey: string;
  eager: boolean;
  highPriority: boolean;
  sizes: string;
  pxTile: { w: number; left: number; top: number; height: number } | null;
  vars?: Record<string, string>;
  setMeasured: React.Dispatch<React.SetStateAction<Record<string, number>>>;
};

function MasonryTile({ item, gi, ratio, tileKey, eager, highPriority, sizes, pxTile, vars, setMeasured }: TileProps) {
  const { openAt, openAlbum } = useGallery();

  const style = (
    pxTile
      ? { left: pxTile.left, top: pxTile.top, width: pxTile.w, height: pxTile.height }
      : { ...vars, '--r': String(ratio) }
  ) as React.CSSProperties;

  // Proportion lue dans l'URL, si l'asset en a une. Elle peut être fausse (asset
  // recadré ou remplacé après coup) : on ne retient la mesure que si elle s'en écarte.
  const known = item.kind === 'image' ? item.ratio : undefined;
  const measure = (w: number, h: number) =>
    setMeasured((p) => {
      if (p[tileKey]) return p;
      const r = w / h;
      if (known && Math.abs(r - known) / known <= RATIO_TOLERANCE) return p;
      return { ...p, [tileKey]: r };
    });

  let content: React.ReactNode = null;
  if (item.kind === 'image') {
    content = (
      <ZoomableImage
        src={item.src}
        alt={item.alt}
        thumbWidth="100%"
        thumbHeight="100%"
        sizes={sizes}
        priority={eager}
        fetchPriority={highPriority ? 'high' : undefined}
        hoverTitle={item.title}
        hoverCaption={item.caption}
        onLoaded={measure}
        onOpen={() => {
          if (item.albumPhotos && item.albumPhotos.length > 0) {
            // Trouver l'index de cette photo dans l'album
            const albumIndex = item.albumPhotos.findIndex(
              (photo) => photo.kind === 'image' && photo.src === item.src
            );
            openAlbum(item.albumPhotos, albumIndex >= 0 ? albumIndex : 0);
          } else {
            // Si pas d'album, créer un carrousel avec juste cette photo
            openAlbum(
              [
                {
                  kind: 'image' as const,
                  src: item.src,
                  alt: item.alt || '',
                  title: item.title || '',
                  caption: item.caption || '',
                },
              ],
              0
            );
          }
        }}
      />
    );
  } else if (item.kind === 'video' || item.kind === 'hybrid') {
    // Hybride : la grille affiche la preview MP4 ; la lightbox ouvre la vidéo complète
    content = (
      <ZoomableVideo
        srcMp4={item.srcMp4}
        srcWebm={item.srcWebm}
        poster={item.poster}
        width="100%"
        height="100%"
        label={item.alt}
        hoverTitle={item.title}
        hoverCaption={item.caption}
        onLoaded={measure}
        onOpen={() => openAt(gi)}
      />
    );
  } else if (item.kind === 'vimeo') {
    content = (
      <ZoomableVimeo
        vimeoId={item.vimeoId}
        alt={item.alt}
        width="100%"
        height="100%"
        hoverTitle={item.title}
        hoverCaption={item.caption}
        onOpen={() => openAt(gi)}
      />
    );
  }

  return (
    <div className="mg-t" style={style} {...(item.blok ? storyblokEditable(item.blok) : {})}>
      {content}
      <EditorVideoWarning item={item} />
    </div>
  );
}

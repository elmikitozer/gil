'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ImageItem = {
  kind: 'image';
  src: string;
  alt?: string;
  title?: string;
  caption?: string;
};
export type VideoItem = {
  kind: 'video';
  srcMp4: string;
  srcWebm?: string;
  poster?: string;
  alt?: string;
  title?: string;
};
export type VimeoVideoItem = {
  kind: 'vimeo';
  vimeoId: string;
  poster?: string;
  alt?: string;
  title?: string;
  ratio?: string;
};
export type HybridVideoItem = {
  kind: 'hybrid';
  srcMp4: string; // Pour la grille (preview Cloudinary)
  vimeoId: string; // Pour la lightbox (vidéo complète Vimeo)
  srcWebm?: string;
  poster?: string;
  alt?: string;
  title?: string;
  ratio?: string;
};
export type Item = ImageItem | VideoItem | VimeoVideoItem | HybridVideoItem;

type GalleryAPI = {
  items: Item[];
  isOpen: boolean;
  index: number;
  openAt: (i: number) => void;
  openAlbum: (albumItems: Item[], startIndex: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
};

const Ctx = createContext<GalleryAPI | null>(null);

export function useGallery() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGallery must be used inside <GalleryProvider>');
  return ctx;
}

export function GalleryProvider({ items, children }: { items: Item[]; children: React.ReactNode }) {
  const [originalItems] = useState(items);
  const [currentItems, setCurrentItems] = useState(items);
  const [isOpen, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const openAt = useCallback((i: number) => {
    setIndex(i);
    setOpen(true);
  }, []);
  
  const openAlbum = useCallback((albumItems: Item[], startIndex: number) => {
    setCurrentItems(albumItems);
    setIndex(startIndex);
    setOpen(true);
  }, []);
  
  const close = useCallback(() => {
    setOpen(false);
    setCurrentItems(originalItems); // Restaurer les items originaux
  }, [originalItems]);
  
  const next = useCallback(() => setIndex((i) => (i + 1) % currentItems.length), [currentItems.length]);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + currentItems.length) % currentItems.length),
    [currentItems.length]
  );

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const value = useMemo(
    () => ({ items: currentItems, isOpen, index, openAt, openAlbum, close, next, prev }),
    [currentItems, isOpen, index, openAt, openAlbum, close, next, prev]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

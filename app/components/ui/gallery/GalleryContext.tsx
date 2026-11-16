'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Item } from './types';

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
  // Album ouvert depuis une vignette ; `null` tant que la galerie affiche la liste reçue en prop.
  // La liste courante est dérivée de la prop : elle suit ses changements (aperçu en direct de l'éditeur).
  const [album, setAlbum] = useState<Item[] | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const currentItems = album ?? items;

  const openAt = useCallback((i: number) => {
    setIndex(i);
    setOpen(true);
  }, []);

  const openAlbum = useCallback((albumItems: Item[], startIndex: number) => {
    setAlbum(albumItems);
    setIndex(startIndex);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setAlbum(null); // Retour à la liste de la prop
  }, []);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % currentItems.length),
    [currentItems.length]
  );
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

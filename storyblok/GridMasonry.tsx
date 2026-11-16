'use client';

import { storyblokEditable } from '@storyblok/react/rsc';
import type { SbBlokData } from '@storyblok/react/rsc';
import MasonryColumns from '@/app/components/MasonryColumns';
import { gridItems, type GridEntryBlok } from '@/lib/gallery-items';

type GridMasonryBlok = SbBlokData & {
  items?: GridEntryBlok[];
};

export default function GridMasonry({ blok }: { blok: GridMasonryBlok }) {
  return (
    <section
      {...storyblokEditable(blok)}
      className="full-bleed px-[8px] md:px-[12px]"
    >
      <MasonryColumns items={gridItems(blok.items)} gap={10} />
    </section>
  );
}

"use client";
// Variante client de Home : résout les blocs imbriqués dans le registre client.
import { StoryblokComponent, storyblokEditable } from "@storyblok/react";
import type { SbBlokData } from "@storyblok/react";

type PageBlok = SbBlokData & {
  body?: SbBlokData[];
};

export default function HomeClient({ blok }: { blok: PageBlok }) {
  const items = Array.isArray(blok.body) ? blok.body : [];

  return (
    <section {...storyblokEditable(blok)} className="container mx-auto px-4 py-16">
      {items.map((nested) => (
        <StoryblokComponent blok={nested} key={nested._uid} />
      ))}
    </section>
  );
}

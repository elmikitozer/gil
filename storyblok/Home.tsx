// /storyblok/Home.tsx
import { StoryblokServerComponent, storyblokEditable } from "@storyblok/react/rsc";
import type { SbBlokData } from "@storyblok/react/rsc";

type PageBlok = SbBlokData & {
  body?: SbBlokData[];
};

export default function Home({ blok }: { blok: PageBlok }) {
  const items = Array.isArray(blok.body) ? blok.body : [];

  return (
    <section {...storyblokEditable(blok)} className="container mx-auto px-4 py-16">
      {items.map((nested) => (
        <StoryblokServerComponent blok={nested} key={nested._uid} />
      ))}
    </section>
  );
}

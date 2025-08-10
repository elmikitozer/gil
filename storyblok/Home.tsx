// /storyblok/Home.tsx
import { StoryblokServerComponent, storyblokEditable } from "@storyblok/react/rsc";

export default function Home({ blok }: any) {
  const items = Array.isArray(blok?.body) ? blok.body : [];

  return (
    <section {...storyblokEditable(blok)} className="container mx-auto px-4 py-16">
      {items.map((nested: any) => (
        <StoryblokServerComponent blok={nested} key={nested._uid} />
      ))}
    </section>
  );
}

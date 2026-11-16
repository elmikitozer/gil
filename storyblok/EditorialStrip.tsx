"use client";
import { storyblokEditable, StoryblokRichText } from "@storyblok/react";
import type { SbBlokData, StoryblokRichTextProps } from "@storyblok/react";

type EditorialStripBlok = SbBlokData & {
  text?: StoryblokRichTextProps["doc"];
  align?: string;
};

export default function EditorialStrip({ blok }: { blok: EditorialStripBlok }) {
  return (
    <section {...storyblokEditable(blok)} className="mt-8 md:mt-12">
      <div className={`text-base md:text-lg ${blok.align === "center" ? "text-center" : ""}`}>
        {/* Rendu en éléments React (pas de HTML injecté) : fonctionne au rendu serveur */}
        {blok.text ? <StoryblokRichText doc={blok.text} /> : null}
      </div>
    </section>
  );
}

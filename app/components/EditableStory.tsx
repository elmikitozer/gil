"use client";

import { storyblokEditable } from "@storyblok/react/rsc";
import { StoryblokServerComponent } from "@storyblok/react/rsc";

export default function EditableStory({ blok }: { blok: any }) {
  // on injecte les attributs storyblokEditable côté client
  return (
    <div {...storyblokEditable(blok)}>
      <StoryblokServerComponent blok={blok} />
    </div>
  );
}

import { storyblokEditable } from "@storyblok/react/rsc";
import type { SbBlokData } from "@storyblok/react/rsc";
import Image from "next/image";

type SplitDiptychBlok = SbBlokData & {
  left?: { filename?: string };
  right?: { filename?: string };
  gap?: string;
  align?: string;
};

// Classes écrites en toutes lettres : Tailwind ne génère pas de classe à partir
// d'une chaîne interpolée (`items-${...}`). « middle » n'existe pas en CSS ;
// il désigne l'alignement centré, qui était la valeur par défaut voulue.
const ALIGN_CLASSES: Record<string, string> = {
  top: "items-start",
  start: "items-start",
  middle: "items-center",
  center: "items-center",
  bottom: "items-end",
  end: "items-end",
};

export default function SplitDiptych({ blok }: { blok: SplitDiptychBlok }) {
  const left = blok.left?.filename;
  const right = blok.right?.filename;
  const gap = blok.gap === "tight" ? "gap-2" : blok.gap === "wide" ? "gap-8" : "gap-4";
  const align = ALIGN_CLASSES[blok.align ?? "middle"] ?? "items-center";
  if (!left && !right) return null;
  return (
    <section {...storyblokEditable(blok)} className={`grid ${gap} grid-cols-1 md:grid-cols-2 ${align} mt-10`}>
      {left && <Image src={left} alt="" width={1600} height={1200} className="w-full h-auto object-cover" />}
      {right && <Image src={right} alt="" width={1600} height={1200} className="w-full h-auto object-cover" />}
    </section>
  );
}

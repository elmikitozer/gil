// import React from "react";

// type CSSVars = React.CSSProperties & {
//   ["--hc-dur"]?: string;
//   ["--title-delay"]?: string;
// };


// export default function HoverCover({
//   text,
//   className = "",
//   durationMs = 600, // durée du voile (et aussi la durée de sortie du titre)
// }: {
//   text?: string;
//   className?: string;
//   durationMs?: number;
// }) {
//   if (!text) return null;

//   // variable CSS partagée (utilisée par le voile ET par le titre)
//   const style: CSSVars = { ["--hc-dur"]: `${durationMs}ms` }; // ✅ typé


//      return (
//      <div
//        aria-hidden="true"
//        style={style}
//        className={[
//       // overlay plein cadre, centrage contenu
//       "absolute inset-0 z-10 pointer-events-none select-none",
//       "flex items-center justify-center",
//          className,
//        ].join(" ")}
//      >
//        {/* Voile blanc plein cadre */}
//        <div
//          className={[
//            "absolute inset-0 bg-white opacity border-[1.5px] border-neutral-900",
//            // app/components/ui/HoverCover.tsx (remplace la ligne d’opacité)
//            "opacity-0 md:group-hover:opacity-95 md:group-focus-visible:opacity-85",
//            "transition-opacity duration-[var(--hc-dur)] ease-[cubic-bezier(.22,.61,.36,1)]",
//            "motion-reduce:transition-none",
//          ].join(" ")}
//        />

//       {/* Titre centré */}
//        <span
//          className={[
//           "px-3 py-2 text-neutral-900 text-center",
//           "text-[10px] md:text-lg leading-none uppercase tracking-[0.18em]",

//           // état de base vs hover (apparition douce au centre)
//           "opacity-0 scale-95",
//           "group-hover:opacity-100 group-hover:scale-100",
//           "group-focus-visible:opacity-100 group-focus-visible:scale-100",

//            // ⬇️ clé: délai piloté par une variable ; 0ms hors hover, 80% du voile en hover
//            "[--title-delay:0ms]",
//            "group-hover:[--title-delay:calc(var(--hc-dur)*0.1)]",
//            "group-focus-visible:[--title-delay:calc(var(--hc-dur)*0.1)]",

//            // le titre a la même durée que le voile → sortie synchronisée
//            "transition-all duration-[var(--hc-dur)] delay-[var(--title-delay)]",
//            "ease-[cubic-bezier(.22,.61,.36,1)]",

//            // accessibilité
//            "motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:scale-100",
//          ].join(" ")}
//        >
//          {text}
//        </span>
//      </div>
//    );

// }


"use client";
import React from "react";

type CSSVars = React.CSSProperties & {
  ["--hc-dur"]?: string;        // durée des transitions
  ["--title-delay"]?: string;   // délai apparition titre
  ["--caption-delay"]?: string; // délai apparition sous-titre
  ["--hc-ov"]?: string;         // opacité overlay (0..1)
};

type Props = {
  text?: string;          // Titre (ex: nom de l’asset)
  caption?: string;       // Sous-titre / légende
  className?: string;
  durationMs?: number;    // 600 par défaut
  variant?: "light" | "dark";        // Couleur du voile
  overlayOpacity?: number;           // 0..1 (ex: 0.9)
  bordered?: boolean;                // Bordure fine autour
};

export default function HoverCover({
  text,
  caption,
  className = "",
  durationMs = 600,
  variant = "light",
  overlayOpacity = 0.9,
  bordered = true,
}: Props) {
  if (!text && !caption) return null;

  const style: CSSVars = {
    ["--hc-dur"]: `${durationMs}ms`,
    ["--title-delay"]: "0ms",
    ["--caption-delay"]: "0ms",
    ["--hc-ov"]: String(overlayOpacity),
  };

  const bgClass = variant === "dark" ? "bg-black" : "bg-white";
  const titleColor = variant === "dark" ? "text-white" : "text-neutral-900";
  const captionColor = variant === "dark" ? "text-neutral-100" : "text-neutral-800";
  const borderClass = bordered ? "border-[1.5px] border-neutral-900" : "";

  return (
    <div
      aria-hidden="true"
      style={style}
      className={[
        "absolute inset-0 z-10 pointer-events-none select-none",
        "flex items-center justify-center",
        className,
      ].join(" ")}
    >
      {/* Voile plein cadre */}
      <div
        className={[
          "absolute inset-0 opacity-0",
          bgClass,
          borderClass,
          "group-hover:opacity-[var(--hc-ov)] group-focus-visible:opacity-[var(--hc-ov)]",
          "transition-opacity duration-[var(--hc-dur)] ease-[cubic-bezier(.22,.61,.36,1)]",
          "motion-reduce:transition-none",
        ].join(" ")}
      />

      {/* Bloc texte centré */}
      <div className="pointer-events-none text-center max-w-[min(85vw,40rem)] px-3">
        {text && (
          <div
            className={[
              titleColor,
              "uppercase tracking-[0.18em]",
              "text-xs md:text-lg leading-tight",
              "opacity-0 translate-y-1",
              "group-hover:opacity-100 group-hover:translate-y-0",
              "group-focus-visible:opacity-100 group-focus-visible:translate-y-0",
              // Titre : apparaît d’abord
              "[--title-delay:0ms]",
              "group-hover:[--title-delay:calc(var(--hc-dur)*0.10)]",
              "group-focus-visible:[--title-delay:calc(var(--hc-dur)*0.10)]",
              "transition-all duration-[var(--hc-dur)] delay-[var(--title-delay)]",
              "ease-[cubic-bezier(.22,.61,.36,1)]",
              "motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0",
            ].join(" ")}
          >
            {text}
          </div>
        )}

        {caption && (
          <div
            className={[
              captionColor,
              "mt-2 text-[11px] md:text-base leading-snug",
              "opacity-0 translate-y-1",
              "group-hover:opacity-100 group-hover:translate-y-0",
              "group-focus-visible:opacity-100 group-focus-visible:translate-y-0",
              // Caption : un peu après le titre
              "[--caption-delay:0ms]",
              "group-hover:[--caption-delay:calc(var(--hc-dur)*0.18)]",
              "group-focus-visible:[--caption-delay:calc(var(--hc-dur)*0.18)]",
              "transition-all duration-[var(--hc-dur)] delay-[var(--caption-delay)]",
              "ease-[cubic-bezier(.22,.61,.36,1)]",
              "motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0",
            ].join(" ")}
          >
            {caption}
          </div>
        )}
      </div>
    </div>
  );
}

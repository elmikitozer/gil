import React from "react";

type CSSVars = React.CSSProperties & {
  ["--hc-dur"]?: string;
  ["--title-delay"]?: string;
};


export default function HoverCover({
  text,
  className = "",
  durationMs = 600, // durée du voile (et aussi la durée de sortie du titre)
}: {
  text?: string;
  className?: string;
  durationMs?: number;
}) {
  if (!text) return null;

  // variable CSS partagée (utilisée par le voile ET par le titre)
  const style: CSSVars = { ["--hc-dur"]: `${durationMs}ms` }; // ✅ typé


  // return (
  //   <div
  //     aria-hidden="true"
  //     style={style}
  //     className={[
  //       "absolute inset-0 z-10 pointer-events-none select-none",
  //       "flex items-center justify-center",
  //       className,
  //     ].join(" ")}
  //   >
  //     {/* Voile blanc plein cadre */}
  //     <div
  //       className={[
  //         "absolute inset-0 bg-white opacity border-[1.5px] border-neutral-900",
  //         // app/components/ui/HoverCover.tsx (remplace la ligne d’opacité)
  //         "opacity-0 md:group-hover:opacity-85 md:group-focus-visible:opacity-85",
  //         "transition-opacity duration-[var(--hc-dur)] ease-[cubic-bezier(.22,.61,.36,1)]",
  //         "motion-reduce:transition-none",
  //       ].join(" ")}
  //     />

  //     {/* Titre haut-gauche — démarre à 80% du voile */}
  //     <span
  //       className={[
  //         "items-center justify-center absolute left-0 top-0 m-[6px] md:m-2 px-2 py-1 text-neutral-900",
  //         // "justify-center align-middle text-neutral-900",
  //         "text-[10px] md:text-lg leading-none uppercase tracking-[0.18em]",

  //         // état de base vs hover
  //         "translate-x-[-18px] opacity-0",
  //         "group-hover:translate-x-0 group-hover:opacity-100",

  //         // ⬇️ clé: délai piloté par une variable ; 0ms hors hover, 80% du voile en hover
  //         "[--title-delay:0ms]",
  //         "group-hover:[--title-delay:calc(var(--hc-dur)*0.1)]",

  //         // le titre a la même durée que le voile → sortie synchronisée
  //         "transition-all duration-[var(--hc-dur)] delay-[var(--title-delay)]",
  //         "ease-[cubic-bezier(.22,.61,.36,1)]",

  //         // accessibilité
  //         "motion-reduce:transition-none motion-reduce:translate-x-0 motion-reduce:opacity-100",
  //       ].join(" ")}
  //     >
  //       {text}
  //     </span>
  //   </div>
  // );
     return (
     <div
       aria-hidden="true"
       style={style}
       className={[
      // overlay plein cadre, centrage contenu
      "absolute inset-0 z-10 pointer-events-none select-none",
      "flex items-center justify-center",
         className,
       ].join(" ")}
     >
       {/* Voile blanc plein cadre */}
       <div
         className={[
           "absolute inset-0 bg-white opacity border-[1.5px] border-neutral-900",
           // app/components/ui/HoverCover.tsx (remplace la ligne d’opacité)
           "opacity-0 md:group-hover:opacity-95 md:group-focus-visible:opacity-85",
           "transition-opacity duration-[var(--hc-dur)] ease-[cubic-bezier(.22,.61,.36,1)]",
           "motion-reduce:transition-none",
         ].join(" ")}
       />

      {/* Titre centré */}
       <span
         className={[
          "px-3 py-2 text-neutral-900 text-center",
          "text-[10px] md:text-lg leading-none uppercase tracking-[0.18em]",

          // état de base vs hover (apparition douce au centre)
          "opacity-0 scale-95",
          "group-hover:opacity-100 group-hover:scale-100",
          "group-focus-visible:opacity-100 group-focus-visible:scale-100",

           // ⬇️ clé: délai piloté par une variable ; 0ms hors hover, 80% du voile en hover
           "[--title-delay:0ms]",
           "group-hover:[--title-delay:calc(var(--hc-dur)*0.1)]",
           "group-focus-visible:[--title-delay:calc(var(--hc-dur)*0.1)]",

           // le titre a la même durée que le voile → sortie synchronisée
           "transition-all duration-[var(--hc-dur)] delay-[var(--title-delay)]",
           "ease-[cubic-bezier(.22,.61,.36,1)]",

           // accessibilité
           "motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:scale-100",
         ].join(" ")}
       >
         {text}
       </span>
     </div>
   );

}

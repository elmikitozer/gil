"use client";
import React from "react";

type CSSVars = React.CSSProperties & {
  ["--hc-dur"]?: string;
  ["--title-delay"]?: string;
  ["--caption-delay"]?: string;
  ["--hc-ov"]?: string;
};

type Props = {
  text?: string;
  caption?: string;
  className?: string;
  durationMs?: number;
  overlayOpacity?: number;
  bordered?: boolean;
};

export default function HoverCover({
  text,
  caption,
  className = "",
  durationMs = 600,
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

  const bgClass = "bg-white dark:bg-black";
  const titleColor = "text-neutral-900 dark:text-white";
  const captionColor = "text-neutral-800 dark:text-neutral-100";
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
              "tracking-[0.05em]",
              "text-base md:text-base leading-tight",
              "opacity-0 translate-y-1",
              "group-hover:opacity-100 group-hover:translate-y-0",
              "group-focus-visible:opacity-100 group-focus-visible:translate-y-0",
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
              "mt-2 text-[11px] md:text-sm leading-snug",
              "opacity-0 translate-y-1",
              "group-hover:opacity-100 group-hover:translate-y-0",
              "group-focus-visible:opacity-100 group-focus-visible:translate-y-0",
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

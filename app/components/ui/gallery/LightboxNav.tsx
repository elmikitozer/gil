"use client";
import { useEffect, useRef } from "react";

export function LightboxNav({
  onNext,
  onPrev,
  label,
}: {
  onNext: () => void;
  onPrev: () => void;
  label?: string;
}) {
  // clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext, onPrev]);

  // swipe
  const startX = useRef<number | null>(null);
  const lastX = useRef<number | null>(null);
  const THRESHOLD = 48;

  return (
    <div
      className="absolute inset-0 z-[64] touch-pan-y select-none"
      onPointerDown={(e) => {
        startX.current = e.clientX;
        lastX.current = e.clientX;
      }}
      onPointerMove={(e) => {
        lastX.current = e.clientX;
      }}
      onPointerUp={() => {
        if (startX.current != null && lastX.current != null) {
          const dx = lastX.current - startX.current;
          if (dx <= -THRESHOLD) onNext();
          if (dx >= THRESHOLD) onPrev();
        }
        startX.current = null;
        lastX.current = null;
      }}
    >
      {/* flèche gauche */}
      <button
        type="button"
        aria-label="Précédent"
        title="Précédent"
        onClick={onPrev}
        className="lb-arrow lb-arrow--left text-neutral-900 dark:text-white"
      >
        <svg viewBox="0 0 24 24" className="lb-arrow__icon" aria-hidden="true">
          <path
            d="M15 6l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </button>

      {/* flèche droite */}
      <button
        type="button"
        aria-label="Suivant"
        title="Suivant"
        onClick={onNext}
        className="lb-arrow lb-arrow--right text-neutral-900 dark:text-white"
      >
        <svg viewBox="0 0 24 24" className="lb-arrow__icon" aria-hidden="true">
          <path
            d="M9 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </button>

      {label ? (
        <div className="pointer-events-none absolute inset-x-0 top-4 z-[66] mx-auto w-fit rounded-full bg-black/5 px-3 py-1 text-xs text-black/70">
          {label}
        </div>
      ) : null}
    </div>
  );
}

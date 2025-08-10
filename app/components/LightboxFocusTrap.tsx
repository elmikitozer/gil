"use client";
import { useEffect, useRef } from "react";

export default function LightboxFocusTrap({ onClose, children }:{
  onClose: () => void; children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement|null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const focusables = root.querySelectorAll<HTMLElement>(
      'button,a,video,[tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(); // ← on utilise onClose ici
      if (e.key !== "Tab" || focusables.length === 0) return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first?.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    first?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return <div ref={ref}>{children}</div>;
}

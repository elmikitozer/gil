"use client";

import { useEffect, useState, useCallback } from "react";
import HoverCover from "@/app/components/ui/HoverCover";
import Image from "next/image";
import LightboxClose from "./ui/LightboxClose";

type Props = {
  src: string;
  alt?: string;
  thumbWidth?: number;
  thumbHeight?: number;
  sizes?: string;
  onLoaded?: (w: number, h: number) => void;
  onOpen?: () => void;
  hoverTitle?: string; // ✅ on déclare la prop ici
  hoverCaption?: string; // ✅ on déclare la prop ici
};

export default function ZoomableImage({
  src,
  alt = "",
  thumbWidth = 1600,
  thumbHeight = 1200,
  sizes,
  onLoaded,
  onOpen,
  hoverTitle,
  hoverCaption,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pressed, setPressed] = useState(false);
  const onClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    // document.addEventListener("keydown", onKey);
    window.addEventListener("keydown", onKey, { passive: true });
    document.body.style.overflow = "hidden";
    return () => {
      // document.removeEventListener("keydown", onKey);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleClick = () => {
    setPressed(true);
    setTimeout(() => {
      if (onOpen) onOpen();
      else setOpen(true);
      setPressed(false);
    }, 90);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`group relative block w-full focus:outline-none cursor-pointer pressable ${
          pressed ? "is-pressed" : ""
        }`}
        style={{ width: thumbWidth, height: thumbHeight, lineHeight: 0 }}
      >
        <div className="absolute inset-0 z-0">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes || `${thumbWidth}px`}
          className="object-cover z-0"
          onLoadingComplete={(img) =>
            onLoaded?.(img.naturalWidth, img.naturalHeight)
          }
        />
        </div>

        {/* Label hover (haut-gauche, slide-in) */}
        <HoverCover text={hoverTitle} caption={hoverCaption} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-0 cursor-pointer lb-anim-bg"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <LightboxClose onClick={() => onClose()} />
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain lb-anim-media"
            sizes="100vw"
            priority
          />
        </div>
      )}
    </>
  );
}

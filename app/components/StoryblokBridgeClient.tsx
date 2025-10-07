"use client";

import { useEffect } from "react";

export default function StoryblokBridgeClient() {
  useEffect(() => {
    // Vérifie que le script Storyblok Bridge est bien injecté
    if (typeof window !== "undefined" && !window.storyblok) {
      const script = document.createElement("script");
      script.src = "https://app.storyblok.com/f/storyblok-v2-latest.js";
      script.async = true;
      script.onload = () => {
        if (window.storyblok) {
          window.storyblok.init();
        }
      };
      document.body.appendChild(script);
    } else if (window.storyblok) {
      window.storyblok.init();
    }
  }, []);

  return null;
}

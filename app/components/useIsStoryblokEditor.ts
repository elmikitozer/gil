'use client';

import { useMemo } from 'react';

export default function useIsStoryblokEditor() {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.has('_storyblok') || sp.has('_storyblok_version')) return true;
      // Fallback: embedded in iframe with Storyblok present
      const inIframe = window.self !== window.top;
      const hasBridge = Boolean((window as Window & typeof globalThis).storyblok);
      return inIframe && hasBridge;
    } catch {
      return false;
    }
  }, []);
}

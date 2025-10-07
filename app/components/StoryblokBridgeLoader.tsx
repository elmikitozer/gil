'use client';

import { useEffect } from 'react';

export default function StoryblokBridgeLoader() {
  useEffect(() => {
    // On évite les doublons
    if (typeof window === 'undefined' || window.storyblok) return;

    const script = document.createElement('script');
    script.src = 'https://app.storyblok.com/f/storyblok-v2-latest.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      console.log('✅ Storyblok Bridge script loaded');
    };
  }, []);

  return null;
}

'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

function detectEditor() {
  try {
    const sp = new URLSearchParams(window.location.search);
    if (sp.has('_storyblok') || sp.has('_storyblok_version')) return true;
    // Fallback: embedded in iframe with Storyblok present
    const inIframe = window.self !== window.top;
    const hasBridge = Boolean(window.storyblok);
    return inIframe && hasBridge;
  } catch {
    return false;
  }
}

// useSyncExternalStore : « false » au rendu serveur et pendant l'hydratation,
// puis la vraie valeur côté navigateur, sans écart d'hydratation.
export default function useIsStoryblokEditor() {
  return useSyncExternalStore(subscribe, detectEditor, () => false);
}

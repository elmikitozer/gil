'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getBrowserYear = () => new Date().getFullYear();

/**
 * Année courante dans une page statique. Le HTML contient l'année du dernier
 * rendu serveur (`fallback`) ; le navigateur la remplace par l'année réelle
 * si elle a changé depuis, sans rendre la page dynamique.
 */
export default function CurrentYear({ fallback }: { fallback: number }) {
  const year = useSyncExternalStore(subscribe, getBrowserYear, () => fallback);
  return <>{year}</>;
}

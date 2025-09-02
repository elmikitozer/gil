// lib/asset-version.ts
import { get } from "@vercel/edge-config";

export async function getAssetBump(): Promise<number> {
  return (await get<number>("assetBump")) ?? 0;
}

export function versionUrl(src: string, bump: number) {
  if (!src) return src;
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}_v=${bump}`;
}

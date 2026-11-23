import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/admin-session';
import { presignPut, publicUrl, r2Configured } from '@/lib/r2';
import { MAX_POSTER_BYTES, MAX_VIDEO_BYTES, isUploadKey, posterKey, uploadKey } from '@/lib/videos';

// Autorisation d'envoi d'un fichier vers R2.
// - { kind: 'video', name, size, width, height } → nouvelle clé unique, URL présignée
// - { kind: 'poster', videoKey, size }            → affiche de cette vidéo
// R2 n'accepte pas de limite de taille dans une URL présignée : la limite est
// vérifiée ici, sur la taille annoncée par la page (accès protégé par mot de passe).

const SUFFIX_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const suffix = () => Array.from(randomBytes(6), (b) => SUFFIX_ALPHABET[b % 36]).join('');
const isDim = (n: unknown): n is number => Number.isInteger(n) && (n as number) >= 16 && (n as number) <= 8192;
const isSize = (n: unknown, max: number): n is number => Number.isInteger(n) && (n as number) > 0 && (n as number) <= max;

export async function POST(request: Request) {
  if (!(await hasAdminSession())) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });
  if (!r2Configured()) return NextResponse.json({ error: 'Le stockage n’est pas configuré.' }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  let key: string;
  let contentType: string;
  if (body.kind === 'video') {
    const { name, size, width, height } = body;
    if (typeof name !== 'string' || !isDim(width) || !isDim(height)) {
      return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
    }
    if (!isSize(size, MAX_VIDEO_BYTES)) {
      return NextResponse.json({ error: 'Fichier trop lourd.' }, { status: 413 });
    }
    key = uploadKey(name, width, height, suffix());
    contentType = 'video/mp4';
  } else if (body.kind === 'poster') {
    const { videoKey, size } = body;
    if (typeof videoKey !== 'string' || !isUploadKey(videoKey)) {
      return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
    }
    if (!isSize(size, MAX_POSTER_BYTES)) {
      return NextResponse.json({ error: 'Affiche trop lourde.' }, { status: 413 });
    }
    key = posterKey(videoKey);
    contentType = 'image/jpeg';
  } else {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const { url, headers } = await presignPut(key, contentType);
  return NextResponse.json(
    { key, uploadUrl: url, headers, publicUrl: publicUrl(key) },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

import { NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/admin-session';
import { headUpload, r2Configured, setUploadSha256 } from '@/lib/r2';
import { isUploadKey } from '@/lib/videos';

// Après l'envoi : enregistre l'empreinte SHA-256 du fichier d'origine sur la vidéo,
// pour reconnaître plus tard un envoi en double. Sans effet si la vidéo en a déjà une.
export async function POST(request: Request) {
  if (!(await hasAdminSession())) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });
  if (!r2Configured()) return NextResponse.json({ error: 'Le stockage n’est pas configuré.' }, { status: 503 });
  let body: { key?: unknown; sha256?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }
  const { key, sha256 } = body;
  if (typeof key !== 'string' || !isUploadKey(key) || typeof sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(sha256)) {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }
  const head = await headUpload(key);
  if (!head) return NextResponse.json({ error: 'Vidéo introuvable.' }, { status: 404 });
  if (!head.sha256) await setUploadSha256(key, sha256);
  return new NextResponse(null, { status: 204 });
}

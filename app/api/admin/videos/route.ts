import { NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/admin-session';
import { listUploads, publicUrl, r2Configured } from '@/lib/r2';
import { isUploadKey, posterKey } from '@/lib/videos';

// Liste des vidéos déjà envoyées, de la plus récente à la plus ancienne.
export async function GET() {
  if (!(await hasAdminSession())) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });
  if (!r2Configured()) return NextResponse.json({ error: 'Le stockage n’est pas configuré.' }, { status: 503 });
  try {
    const objects = await listUploads();
    const keys = new Set(objects.map((o) => o.key));
    const videos = objects
      .filter((o) => isUploadKey(o.key))
      .sort((a, b) => b.lastModified.localeCompare(a.lastModified))
      .map((o) => ({
        key: o.key,
        url: publicUrl(o.key),
        poster: keys.has(posterKey(o.key)) ? publicUrl(posterKey(o.key)) : null,
        size: o.size,
        lastModified: o.lastModified,
      }));
    return NextResponse.json({ videos }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'La liste des vidéos n’a pas pu être lue.' }, { status: 502 });
  }
}

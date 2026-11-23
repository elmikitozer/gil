import 'server-only';
import { getStoryblokToken } from '@/lib/storyblok';

// Recherche des vidéos utilisées dans le contenu Storyblok (toutes les stories, brouillon ET
// publié), pour interdire la suppression d'une vidéo encore en ligne ou en préparation.
// On cherche le nom de fichier (.mp4 ou .jpg) dans le JSON brut : quel que soit l'hôte du lien
// (r2.dev ou domaine définitif) et quel que soit le champ (grille, album, texte riche…).
// Toute erreur remonte : l'appelant doit alors refuser la suppression (échec « fermé »).

const STORIES = 'https://api.storyblok.com/v2/cdn/stories';
const PER_PAGE = 100;

async function allStoriesText(version: 'draft' | 'published'): Promise<string> {
  const token = getStoryblokToken();
  const chunks: string[] = [];
  for (let page = 1; page <= 50; page++) {
    const params = new URLSearchParams({ version, token, per_page: String(PER_PAGE), page: String(page) });
    const res = await fetch(`${STORIES}?${params}`, { cache: 'no-store', signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`Storyblok a répondu ${res.status} (${version}, page ${page})`);
    const text = await res.text();
    chunks.push(text);
    const total = Number(res.headers.get('total') ?? 0);
    const count = (JSON.parse(text) as { stories?: unknown[] }).stories?.length ?? 0;
    if (count < PER_PAGE || page * PER_PAGE >= total) break;
  }
  return chunks.join('\n');
}

/** Contenu de toutes les stories, brouillon et publié, en un seul texte. */
export async function storyblokContentText(): Promise<string> {
  const [draft, published] = await Promise.all([allStoriesText('draft'), allStoriesText('published')]);
  return `${draft}\n${published}`;
}

/** Vrai si la vidéo (ou son affiche) apparaît dans le contenu. */
export function isUsedIn(content: string, videoKey: string): boolean {
  const base = videoKey.replace(/^uploads\//, '').replace(/\.mp4$/, '');
  return content.includes(`${base}.mp4`) || content.includes(`${base}.jpg`);
}

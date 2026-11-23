import 'server-only';
import { AwsClient } from 'aws4fetch';
import { UPLOAD_CACHE_CONTROL, UPLOAD_PREFIX } from '@/lib/videos';

// Accès au bucket Cloudflare R2 des vidéos, par l'API compatible S3.
// Les clés restent côté serveur : le navigateur ne reçoit que des URL
// présignées, valables quelques minutes, pour un seul fichier.
//
// Variables (voir .env.example) :
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
//   VIDEOS_PUBLIC_BASE_URL : adresse publique du bucket, sans barre finale
//     (https://pub-….r2.dev aujourd'hui, https://videos.gilanselmi.com ensuite)
//   R2_ENDPOINT (facultatif) : remplace https://<compte>.r2.cloudflarestorage.com
//     (tests locaux uniquement)

const PRESIGN_SECONDS = 15 * 60;

type R2Config = { client: AwsClient; bucketUrl: string; publicBase: string };

function config(): R2Config | null {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, VIDEOS_PUBLIC_BASE_URL, R2_ENDPOINT } =
    process.env;
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !VIDEOS_PUBLIC_BASE_URL) return null;
  if (!R2_ENDPOINT && !R2_ACCOUNT_ID) return null;
  const endpoint = (R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`).replace(/\/+$/, '');
  return {
    client: new AwsClient({
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      service: 's3',
      region: 'auto',
    }),
    bucketUrl: `${endpoint}/${R2_BUCKET}`,
    publicBase: VIDEOS_PUBLIC_BASE_URL.replace(/\/+$/, ''),
  };
}

export function r2Configured(): boolean {
  return config() !== null;
}

function required(): R2Config {
  const c = config();
  if (!c) throw new Error('Configuration R2 incomplète');
  return c;
}

const encodeKey = (key: string) => key.split('/').map(encodeURIComponent).join('/');

/** Adresse publique d'un fichier du bucket. */
export function publicUrl(key: string): string {
  return `${required().publicBase}/${encodeKey(key)}`;
}

/**
 * URL présignée pour un PUT direct depuis le navigateur. Les en-têtes
 * Content-Type et Cache-Control font partie de la signature : le navigateur
 * doit envoyer exactement les valeurs renvoyées dans `headers`.
 */
export async function presignPut(key: string, contentType: string) {
  const { client, bucketUrl } = required();
  const url = new URL(`${bucketUrl}/${encodeKey(key)}`);
  url.searchParams.set('X-Amz-Expires', String(PRESIGN_SECONDS));
  const headers = { 'Content-Type': contentType, 'Cache-Control': UPLOAD_CACHE_CONTROL };
  const signed = await client.sign(url.toString(), { method: 'PUT', headers, aws: { signQuery: true, allHeaders: true } });
  return { url: signed.url, headers };
}

export type StoredObject = { key: string; size: number; lastModified: string };

const tag = (xml: string, name: string) => new RegExp(`<${name}>([^<]*)</${name}>`).exec(xml)?.[1];
const decodeXml = (s: string) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

/** Tous les fichiers sous uploads/ (ListObjectsV2, pages de 1 000). */
export async function listUploads(): Promise<StoredObject[]> {
  const { client, bucketUrl } = required();
  const objects: StoredObject[] = [];
  let token: string | undefined;
  do {
    const url = new URL(bucketUrl);
    url.searchParams.set('list-type', '2');
    url.searchParams.set('prefix', UPLOAD_PREFIX);
    if (token) url.searchParams.set('continuation-token', token);
    const res = await client.fetch(url.toString(), { method: 'GET' });
    const xml = await res.text();
    if (!res.ok) throw new Error(`R2 a répondu ${res.status} à la liste des fichiers`);
    for (const m of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
      const key = tag(m[1], 'Key');
      if (!key) continue;
      objects.push({
        key: decodeXml(key),
        size: Number(tag(m[1], 'Size') ?? 0),
        lastModified: tag(m[1], 'LastModified') ?? '',
      });
    }
    token = tag(xml, 'IsTruncated') === 'true' ? tag(xml, 'NextContinuationToken') : undefined;
  } while (token);
  return objects;
}

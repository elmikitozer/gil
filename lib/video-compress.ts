// Préparation d'une vidéo dans le navigateur avant son envoi (page /admin/videos).
// Chargé uniquement par cette page (import dynamique) : rien pour le site public.
//
// Décision, mesurée le 2026-11-23 sur les 13 vidéos du site et des échantillons
// (4K HEVC, 60 i/s, ProRes, HDR), voir docs/VIDEOS_R2.md :
// - fichier déjà léger (H.264, petit côté ≤ 1080 px, ≤ 30 i/s, débit sous le plafond) :
//   envoyé tel quel (MP4) ou recopié sans réencodage dans un MP4 (MOV) ;
// - sinon réencodé en H.264 à qualité constante (quantificateur 22, puis 26 si le
//   débit dépasse le plafond), petit côté ramené à 1080 px, 30 i/s au plus ;
// - le réencodage exige le mode « quantizer » de WebCodecs : Chrome l'a, Safari non
//   (Safari encoderait en Baseline à débit fixe, nettement moins bien) ;
// - ProRes et autres formats non décodables, vidéos HDR, plus de 60 s : refusés
//   avec un message qui dit quoi faire.
import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
  Quality,
  type InputAudioTrack,
  type InputVideoTrack,
} from 'mediabunny';
import { MAX_VIDEO_BYTES, MAX_VIDEO_SECONDS } from '@/lib/videos';
import { PosterError, posterAndSize as posterFromBlob } from '@/lib/video-poster';

const MAX_SHORT_SIDE = 1080;
const MAX_FPS = 30;
/** Plafond de débit : 0,13 bit par pixel et par image (≈ 8 Mbit/s en 1080×1920 à 30 i/s). */
const CEILING_BPP = 0.13;
/** Débit de secours si l'encodeur ignore le quantificateur. */
const FALLBACK_BPP = 0.075;
const QUANTIZERS = [22, 26];

export type Prepared = {
  /** Fichier à envoyer (MP4). */
  blob: Blob;
  /** Ce qui a été fait, pour l'affichage. */
  action: 'as-is' | 'remux' | 'compressed';
  originalBytes: number;
};

export class PrepareError extends Error {}

export type Progress = (stage: 'analyse' | 'compress', fraction: number) => void;

const even = (x: number) => Math.max(2, Math.round(x / 2) * 2);
const pixelRate = (w: number, h: number, fps: number) => w * h * Math.min(fps || MAX_FPS, MAX_FPS);
const mb = (bytes: number) => `${(bytes / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo`;

const HANDBRAKE = 'Convertissez-la avec HandBrake (voir la fiche « Préparer une vidéo »), puis envoyez le fichier obtenu.';

/** Vrai si ce navigateur sait réencoder en H.264 à qualité constante (Chrome : oui, Safari : non). */
export async function canCompress(width = 1080, height = 1920): Promise<boolean> {
  if (typeof VideoEncoder === 'undefined') return false;
  try {
    const support = await VideoEncoder.isConfigSupported({
      codec: 'avc1.640028',
      width,
      height,
      bitrate: 4_000_000,
      framerate: 30,
      bitrateMode: 'quantizer',
    });
    return support.supported === true;
  } catch {
    return false;
  }
}

/**
 * Remet l'étiquette couleur du MP4 (boîte « colr » nclx) en BT.709, plage vidéo.
 * Chrome marque en sRGB les images redimensionnées ; Safari affiche alors la vidéo
 * environ 10 niveaux plus sombre (mesuré). Sans boîte colr : rien à faire.
 */
function fixSrgbTransfer(buffer: ArrayBuffer): void {
  const b = new Uint8Array(buffer);
  const pattern = [0x63, 0x6f, 0x6c, 0x72, 0x6e, 0x63, 0x6c, 0x78]; // « colrnclx »
  search: for (let i = 0; i < b.length - 15; i++) {
    for (let k = 0; k < pattern.length; k++) if (b[i + k] !== pattern[k]) continue search;
    const p = i + 8; // primaires (2 octets), transfert (2), matrice (2), plage (1)
    const transfer = (b[p + 2] << 8) | b[p + 3];
    if (transfer === 13) b.set([0, 1], p + 2); // iec61966-2-1 (sRGB) → bt709
    return;
  }
}

async function isHdr(track: InputVideoTrack): Promise<boolean> {
  if (await track.hasHighDynamicRange().catch(() => false)) return true;
  const c = await track.getColorSpace().catch(() => null);
  if (!c) return false;
  // Valeurs WebCodecs absentes des types TypeScript de la DOM : comparées en chaînes.
  const [transfer, primaries, matrix] = [c.transfer, c.primaries, c.matrix].map((v) => String(v ?? ''));
  return transfer === 'pq' || transfer === 'hlg' || primaries === 'bt2020' || matrix === 'bt2020-ncl';
}

function codecLabel(codec: string | null): string {
  if (!codec) return 'un format inconnu';
  const names: Record<string, string> = { prores: 'ProRes', hevc: 'HEVC (H.265)', avc: 'H.264', vp9: 'VP9', av1: 'AV1' };
  return names[codec] ?? codec;
}

async function convert(input: Input, video: object, audio: object | undefined, onProgress?: (p: number) => void) {
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() });
  const conversion = await Conversion.init({ input, output, showWarnings: false, video, audio });
  if (!conversion.isValid) {
    throw new PrepareError(`Ce fichier ne peut pas être converti. ${HANDBRAKE}`);
  }
  if (onProgress) conversion.onProgress = (p) => onProgress(p);
  await conversion.execute();
  const buffer = output.target.buffer;
  if (!buffer) throw new PrepareError('La conversion n’a rien produit. Réessayez.');
  return buffer;
}

/** Prépare un fichier pour l'envoi. Lève `PrepareError` avec un message en français. */
export async function prepareVideo(file: File, onProgress?: Progress): Promise<Prepared> {
  onProgress?.('analyse', 0);
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  let video: InputVideoTrack | null;
  let audio: InputAudioTrack | null;
  let duration: number;
  let mime = '';
  try {
    video = await input.getPrimaryVideoTrack();
    audio = await input.getPrimaryAudioTrack();
    duration = await input.computeDuration();
    mime = (await input.getMimeType().catch(() => '')) || '';
  } catch {
    throw new PrepareError(
      'Ce fichier n’est pas une vidéo lisible. Choisissez un fichier .mp4 ou .mov exporté depuis votre logiciel de montage.'
    );
  }
  if (!video) throw new PrepareError('Ce fichier ne contient pas d’image vidéo. Choisissez un fichier .mp4 ou .mov.');
  if (!(duration > 0)) throw new PrepareError('La durée de cette vidéo est illisible. ' + HANDBRAKE);
  if (duration > MAX_VIDEO_SECONDS + 0.5) {
    throw new PrepareError(
      `Cette vidéo dure ${Math.round(duration)} s ; la limite est de ${MAX_VIDEO_SECONDS} s. Raccourcissez-la avant de l’envoyer.`
    );
  }
  if (!(await video.canDecode())) {
    throw new PrepareError(`Cette vidéo est en ${codecLabel(video.codec)}, que le navigateur ne sait pas lire. ${HANDBRAKE}`);
  }
  if (await isHdr(video)) {
    throw new PrepareError(
      'Cette vidéo est en HDR (couleurs étendues, fréquent sur iPhone) : elle s’afficherait différemment des autres. ' +
        'Exportez-la en SDR depuis votre logiciel de montage, ou sur iPhone désactivez Réglages > Appareil photo > Enregistrer vidéo > Vidéo HDR avant de filmer.'
    );
  }

  const stats = await video.computePacketStats(120).catch(() => null);
  const fps = stats?.averagePacketRate || MAX_FPS;
  const w0 = video.displayWidth;
  const h0 = video.displayHeight;
  const shortSide = Math.min(w0, h0);
  const scale = shortSide > MAX_SHORT_SIDE ? MAX_SHORT_SIDE / shortSide : 1;
  const width = even(w0 * scale);
  const height = even(h0 * scale);
  const frameRate = fps > MAX_FPS + 1 ? MAX_FPS : undefined;
  const ceiling = Math.max(2_000_000, CEILING_BPP * pixelRate(width, height, frameRate ?? fps));
  const bitrate = (file.size * 8) / duration;
  const playable = video.codec === 'avc' && (!audio || audio.codec === 'aac');
  const fits = playable && scale === 1 && !frameRate;
  const isMp4 = /mp4/i.test(mime);
  onProgress?.('analyse', 1);

  // 1. Déjà léger : on n'y touche pas (MP4) ou on recopie les pistes dans un MP4 (MOV).
  if (fits && bitrate <= ceiling && file.size <= MAX_VIDEO_BYTES) {
    if (isMp4) return { blob: file, action: 'as-is', originalBytes: file.size };
    const buffer = await convert(input, {}, audio ? {} : undefined, (p) => onProgress?.('compress', p));
    return { blob: new Blob([buffer], { type: 'video/mp4' }), action: 'remux', originalBytes: file.size };
  }

  // 2. À réencoder : uniquement si le navigateur sait le faire correctement.
  if (!(await canCompress(width, height))) {
    if (fits && file.size <= MAX_VIDEO_BYTES) {
      // Lisible partout mais un peu lourd : mieux vaut l'envoyer que bloquer.
      if (isMp4) return { blob: file, action: 'as-is', originalBytes: file.size };
      const buffer = await convert(input, {}, audio ? {} : undefined, (p) => onProgress?.('compress', p));
      return { blob: new Blob([buffer], { type: 'video/mp4' }), action: 'remux', originalBytes: file.size };
    }
    throw new PrepareError(
      'Cette vidéo doit être compressée et ce navigateur ne sait pas le faire correctement. ' +
        'Ouvrez cette page dans Google Chrome et recommencez. ' +
        HANDBRAKE.replace('Convertissez-la', 'Sinon, convertissez-la')
    );
  }

  const audioOptions = audio
    ? audio.codec === 'aac'
      ? {}
      : { codec: 'aac', quality: new Quality({ bitrate: 128_000 }) }
    : undefined;
  const fallbackBitrate = Math.round(Math.max(1_000_000, FALLBACK_BPP * pixelRate(width, height, frameRate ?? fps)));
  let best: ArrayBuffer | null = null;
  for (let i = 0; i < QUANTIZERS.length; i++) {
    const buffer = await convert(
      input,
      {
        codec: 'avc',
        width,
        height,
        fit: 'fill',
        frameRate,
        forceTranscode: true,
        keyFrameInterval: 2,
        quality: new Quality({ quantizer: QUANTIZERS[i], bitrate: fallbackBitrate }),
      },
      audioOptions,
      (p) => onProgress?.('compress', (i + p) / QUANTIZERS.length)
    );
    fixSrgbTransfer(buffer);
    best = buffer;
    if ((buffer.byteLength * 8) / duration <= ceiling) break;
  }
  onProgress?.('compress', 1);
  if (!best) throw new PrepareError('La compression a échoué. Réessayez.');

  // Original déjà lisible partout et plus léger que le résultat : on garde l'original.
  if (fits && isMp4 && file.size <= best.byteLength && file.size <= MAX_VIDEO_BYTES) {
    return { blob: file, action: 'as-is', originalBytes: file.size };
  }
  if (best.byteLength > MAX_VIDEO_BYTES) {
    throw new PrepareError(
      `Même compressée, cette vidéo pèse ${mb(best.byteLength)} (limite : ${mb(MAX_VIDEO_BYTES)}). Raccourcissez-la, ou ${HANDBRAKE.charAt(0).toLowerCase()}${HANDBRAKE.slice(1)}`
    );
  }
  return { blob: new Blob([best], { type: 'video/mp4' }), action: 'compressed', originalBytes: file.size };
}

/** Affiche et dimensions : voir lib/video-poster.ts (première image non noire). */
export async function posterAndSize(blob: Blob) {
  try {
    return await posterFromBlob(blob);
  } catch (e) {
    if (e instanceof PosterError) throw new PrepareError(`${e.message} ${HANDBRAKE}`);
    throw e;
  }
}

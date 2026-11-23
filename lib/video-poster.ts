// Affiche d'une vidéo (image affichée avant la lecture) et dimensions réelles d'affichage,
// lues par le navigateur. Module autonome (aucun import) : la page d'envoi l'utilise, et le
// même fichier, transpilé, a servi à régénérer les affiches des vidéos migrées.
//
// Affiche = première image NON NOIRE parmi les 3 premières secondes (une image toutes les
// 0,1 s) : beaucoup de films commencent par un fondu au noir. Si l'image s'éclaircit encore
// nettement (fondu en cours), on avance jusqu'à ce que la luminosité se stabilise. Si toutes
// sont sombres, l'image la plus claire de l'échantillon.

/** Luminance moyenne (0-255) en dessous de laquelle une image est jugée noire. */
export const POSTER_BLACK_THRESHOLD = 24;
/** Fondu en cours tant que la luminance gagne plus de 5 % d'une image à la suivante. */
const FADE_GROWTH = 1.05;
const SCAN_SECONDS = 3;
const SCAN_STEP = 0.1;
const POSTER_MAX_WIDTH = 720;
const POSTER_QUALITY = 0.8;

function seek(v: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve) => {
    if (Math.abs(v.currentTime - t) < 1e-3 && v.readyState >= 2) return resolve();
    v.onseeked = () => resolve();
    v.currentTime = t;
  });
}

function meanLuma(v: HTMLVideoElement, probe: CanvasRenderingContext2D): number {
  probe.drawImage(v, 0, 0, 32, 32);
  const d = probe.getImageData(0, 0, 32, 32).data;
  let sum = 0;
  for (let i = 0; i < d.length; i += 4) sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  return sum / (d.length / 4);
}

/** Instant (s) de la première image non noire, et sa luminance moyenne. */
export async function pickPosterTime(v: HTMLVideoElement): Promise<{ time: number; luma: number }> {
  const probeCanvas = document.createElement('canvas');
  probeCanvas.width = 32;
  probeCanvas.height = 32;
  const probe = probeCanvas.getContext('2d', { willReadFrequently: true })!;
  const end = Math.min(SCAN_SECONDS, Math.max(0, (v.duration || 0) - 0.05));
  let best = { time: 0, luma: -1 };
  let lit: { time: number; luma: number } | null = null; // première image non noire
  for (let t = 0; t <= end + 1e-6; t += SCAN_STEP) {
    const time = Math.round(t * 1000) / 1000;
    await seek(v, time);
    const luma = meanLuma(v, probe);
    if (lit) {
      // Fondu terminé : la luminance ne progresse plus nettement.
      if (luma < lit.luma * FADE_GROWTH) return lit;
      lit = { time, luma };
      continue;
    }
    if (luma >= POSTER_BLACK_THRESHOLD) lit = { time, luma };
    else if (luma > best.luma) best = { time, luma };
  }
  return lit ?? best;
}

export class PosterError extends Error {}

/** Affiche JPEG (720 px de large au plus) et dimensions d'affichage de la vidéo. */
export async function posterAndSize(
  blob: Blob
): Promise<{ poster: Blob; width: number; height: number; time: number; luma: number }> {
  const url = URL.createObjectURL(blob);
  const v = document.createElement('video');
  v.muted = true;
  v.playsInline = true;
  v.preload = 'auto';
  v.src = url;
  try {
    await new Promise<void>((resolve, reject) => {
      v.onloadeddata = () => resolve();
      v.onerror = () => reject(new PosterError('Le navigateur n’arrive pas à lire la vidéo préparée.'));
    });
    const { time, luma } = await pickPosterTime(v);
    await seek(v, time);
    const width = v.videoWidth;
    const height = v.videoHeight;
    // Affiche réduite : elle n'est visible qu'avant le démarrage de la vidéo.
    const scale = Math.min(1, POSTER_MAX_WIDTH / width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const g = canvas.getContext('2d')!;
    g.imageSmoothingQuality = 'high';
    g.drawImage(v, 0, 0, canvas.width, canvas.height);
    const poster = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new PosterError('L’affiche n’a pas pu être créée.'))), 'image/jpeg', POSTER_QUALITY)
    );
    return { poster, width, height, time, luma };
  } finally {
    URL.revokeObjectURL(url);
    v.removeAttribute('src');
    v.load();
  }
}
